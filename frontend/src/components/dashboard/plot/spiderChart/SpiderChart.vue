<template>
    <div ref="chartRef" class="spider-chart flex justify-center"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, PropType } from 'vue';
import * as Plot from '@observablehq/plot';
import * as d3 from 'd3';
import { AggregatedReportResult } from '@/services/reporting';
import { round, toTons } from '@/services/helper';

const props = defineProps({
    data: {
        type: Object as PropType<AggregatedReportResult>,
        required: true,
    },
});

interface ChartDataTypes {
    name: String,
    key: String,
    value: number | String
}

const chartRef = ref<HTMLElement | null>(null);

const sum = (data: number[]) => {
    return data.reduce((a, b) => a + b, 0);
};

onMounted(() => {
    const stats = JSON.parse(JSON.stringify(props.data)) as AggregatedReportResult;
    let points: ChartDataTypes[] = []
    const totalStatsSum = round(toTons(stats.stat.sum))
    Object.entries(stats.timeseries).forEach(([key, val]) => {
        const timeseriesVal = val as { name: string; year: number; timestamp: string; sum: number }[];
        points.push({
            name: 'Categories',
            key: key,
            value:( round(toTons(sum(
                timeseriesVal.map((entry) => entry.sum),
            ))) / totalStatsSum)
        })
    })
    points = points.sort((a:ChartDataTypes, b:ChartDataTypes) =>  (a.value as any) - (b.value as any));
    if (chartRef.value) {
        const longitude = d3.scalePoint(new Set(Plot.valueof(points, "key")), [180, -180]).padding(0.5).align(1)
        const radarChart = Plot.plot({
            width: 1000,
            projection: {
                type: 'azimuthal-equidistant',
                rotate: [0, -90],
                domain: d3.geoCircle().center([0, 90]).radius(0.625)()
            },
            marks: [
                Plot.geo([0.5, 0.4, 0.3, 0.2, 0.1], {
                    geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
                    stroke: "black",
                    fill: "black",
                    strokeOpacity: 0.3,
                    fillOpacity: 0.03,
                    strokeWidth: 0.5
                }),
                Plot.link(longitude.domain(), {
                    x1: longitude,
                    y1: 90 - 0.57,
                    x2: 0,
                    y2: 90,
                    stroke: 'white',
                    strokeOpacity: 0.5,
                    strokeWidth: 2.5
                }),
                Plot.text([0.3, 0.4, 0.5], {
                    x: 180,
                    y: d => 90 - d,
                    dx: 2,
                    textAnchor: 'start',
                    text: d => `${100 * d}%`,
                    fill: 'currentColor',
                    stroke: 'white',
                    fontSize: 8
                }),
                Plot.text(longitude.domain(), {
                    x: longitude,
                    y: 90 - 0.57,
                    text: Plot.identity,
                    lineWidth: 5
                }),
                Plot.area(points, {
                    x1: ({ key }) => longitude(key),
                    y1: ({ value }) => 90 - value,
                    x2: 0,
                    y2: 90,
                    fill: 'name',
                    stroke: 'name',
                    fillOpacity: 0.4,
                    curve: 'cardinal-closed'
                }),
                Plot.dot(points, {
                    x: ({ key }) => longitude(key),
                    y: ({ value }) => 90 - value,
                    fill: 'name',
                    stroke: 'white'
                }),
                Plot.text(
                    points,
                    Plot.pointer({
                        x: ({ key }) => longitude(key),
                        y: ({ value }) => 90 - value,
                        text: d => `${d.key} : ${(d.value * totalStatsSum).toLocaleString()} to`,
                        textAnchor: 'start',
                        fontSize:14,
                        dx: 10,
                        fill: 'green',
                        stroke: 'white',
                        maxRadius: 10,
                    })
                )
            ]
        });

        chartRef.value.appendChild(radarChart);
    }
});
</script>

<style>

    .spider-chart{
        transform: scale(0.7);
    }
    .spider-chart figure{
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
