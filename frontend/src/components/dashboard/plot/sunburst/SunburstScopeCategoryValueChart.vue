<template>
  <div ref="chartContainer" class="flex justify-center"></div>
</template>

<script setup lang="ts">
// reference: https://observablehq.com/@d3/sunburst/2

import { ref, onMounted, watch, PropType } from 'vue';
import * as d3 from 'd3';
import { TimeseriesDataEntry } from '../../../../services/reporting';
// import { toTons, round } from '@/services/helper';
import { getMonochromeColorPalette } from '@/services/colors';

const props = defineProps({
  data: {
    type: Array as PropType<TimeseriesDataEntry[]>,
    required: true,
  },
});

interface ChartNode {
  name: string;
  children?: ChartNode[];
  value?: number;
}

const chartContainer = ref<HTMLElement | null>(null);

const renderChart = () => {
  if (!chartContainer.value) return;

  const width = 932;
  // const height = width;
  const radius = width / 6;

  // Daten vorbereiten
  const chartData: ChartNode = {
    name: '',
    children: [],
  };

  const scopeMap = new Map<number, ChartNode>();
  props.data.forEach((entry) => {
    if (!scopeMap.has(entry.scope)) {
      scopeMap.set(entry.scope, { name: `Scope ${entry.scope}`, children: [] });
    }
    const scopeNode = scopeMap.get(entry.scope)!;

    let categoryNode = scopeNode.children!.find(
      (child) => child.name === entry.category,
    );
    if (!categoryNode) {
      categoryNode = { name: entry.category, children: [] };
      scopeNode.children!.push(categoryNode);
    }

    categoryNode.children!.push({
      name: entry.name,
      value: entry.sumValue,
    });
  });
  chartData.children = Array.from(scopeMap.values());

  // Ersetzen Sie die bestehende Farbskala durch die neue Funktion
  const colorPalette = getMonochromeColorPalette(scopeMap.size + 1);
  const color = d3.scaleOrdinal(colorPalette);

  const partition = (data: ChartNode) => {
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return d3.partition<ChartNode>().size([2 * Math.PI, root.height + 1])(root);
  };

  const root = partition(chartData);
  root.each((d) => ((d as any).current = d));

  const svg = d3
    .select(chartContainer.value)
    .append('svg')
    .attr('viewBox', [0, 0, width, width])
    .style('font', '10px sans-serif');

  const g = svg
    .append('g')
    .attr('transform', `translate(${width / 2},${width / 2})`);

  const arc = d3
    .arc<d3.HierarchyRectangularNode<ChartNode>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius((d) => d.y0 * radius)
    .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

  const path = g
    .append('g')
    .selectAll('path')
    .data(root.descendants().slice(1))
    .join('path')
    .attr('fill', (d) => {
      while (d.depth > 1) d = d.parent!;
      return color(d.data.name);
    })
    .attr('fill-opacity', (d) =>
      arcVisible((d as any).current) ? (d.children ? 0.6 : 0.4) : 0,
    )
    .attr('pointer-events', (d) =>
      arcVisible((d as any).current) ? 'auto' : 'none',
    )
    .attr('d', (d) => arc((d as any).current));

  path
    .filter((d: any) => d.children)
    .style('cursor', 'pointer')
    .on('click', clicked);

  path.append('title').text(
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join('/')}\n${d3.format(',d')(d.value!)}`,
  );

  const label = g
    .append('g')
    .attr('pointer-events', 'none')
    .attr('text-anchor', 'middle')
    .style('user-select', 'none')
    .selectAll('text')
    .data(root.descendants().slice(1))
    .join('text')
    .attr('dy', '0.35em')
    .attr('fill-opacity', (d) => +labelVisible((d as any).current))
    .attr('transform', (d) => labelTransform((d as any).current))
    .text((d) => d.data.name);

  const parent = g
    .append('circle')
    .datum(root)
    .attr('r', radius)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('click', clicked);

  function clicked(
    _event: MouseEvent,
    p: d3.HierarchyRectangularNode<ChartNode>,
  ) {
    parent.datum(p.parent || root);

    root.each(
      (d) =>
        ((d as any).target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        }),
    );

    const t = g.transition().duration(750);

    path
      .transition(t as any)
      .tween('data', (d: any) => {
        const i = d3.interpolate(d.current, d.target);
        return (t: number) => (d.current = i(t));
      })
      // @ts-ignore
      .filter(function (this: SVGPathElement | null, d: any) {
        return (
          this &&
          (+this.getAttribute('fill-opacity')! || arcVisible((d as any).target))
        );
      })
      .attr('fill-opacity', (d) =>
        arcVisible((d as any).target) ? (d.children ? 0.6 : 0.4) : 0,
      )
      .attr('pointer-events', (d) =>
        arcVisible((d as any).target) ? 'auto' : 'none',
      )
      .attrTween('d', (d: any) => () => arc(d.current) as any);

    label
      // @ts-ignore
      .filter(function (this: SVGTextElement | null, d: any) {
        return (
          this &&
          (+this.getAttribute('fill-opacity')! ||
            labelVisible((d as any).target))
        );
      })
      .transition(t as any)
      .attr('fill-opacity', (d) => +labelVisible((d as any).target))
      .attrTween('transform', (d: any) => () => labelTransform(d.current));
  }

  function arcVisible(d: d3.HierarchyRectangularNode<ChartNode>) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d: d3.HierarchyRectangularNode<ChartNode>) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d: d3.HierarchyRectangularNode<ChartNode>) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
};

watch(() => props.data, renderChart, { deep: true });

onMounted(() => {
  if (chartContainer.value && props.data) {
    renderChart();
  }
});
</script>

<style scoped>
svg {
  max-width: 100%;
  height: auto;
}
</style>
