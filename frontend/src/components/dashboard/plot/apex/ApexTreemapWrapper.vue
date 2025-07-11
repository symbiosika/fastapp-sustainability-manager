<template>
  <h4 v-if="label">
    {{ label }}
  </h4>
  <div v-if="chartData && chartData.length > 0">
    <apexchart
      width="100%"
      type="treemap"
      :options="chartOptions"
      :series="chartData"
    ></apexchart>
  </div>
  <div v-else>
    <p>{{ $t('demo.noDataAvailable') }}</p>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  Ref,
  onMounted,
  defineProps,
  PropType,
  watch,
  computed,
  ComputedRef,
} from 'vue';
import { AggregatedReportResult } from '../../../../services/reporting/index';
import { round, toTons } from '../../../../services/helper/index';
import { useGlobalStore } from '../../../../stores/global';
import { getMonochromeColorPalette } from './../../../../services/colors';

const globalStore = useGlobalStore();

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  data: {
    type: Object as PropType<AggregatedReportResult>,
    required: true,
  },
  decimals: {
    type: Number,
    required: false,
    default: 0,
  },
});

/**
 * demo chart:
 series: [
  {
  data: [
    {
      x: 'New Delhi',
      y: 218
    },
    {
      x: 'Kolkata',
      y: 149
    },
    ...
  ]
 */

/*
export interface AggregatedReportResult {
  stat: {
    sum: number; // over all data
  };
  timeseries: {
    [name: string]: {
      name: string;
      year: number;
      timestamp: string;
      sum: number;
    }[];
  };
}
*/
interface ChartData {
  data: {
    x: string;
    y: number;
  }[];
}

const chartData: Ref<ChartData[]> = ref([]);

const categories = ref<string[]>([]);
const colors = ref<string[]>([]);
const chartOptions: ComputedRef<any> = computed(() => {
  return {
    chart: {
      type: 'treemap',
    },
    xaxis: {
      categories: categories.value,
    },
    plotOptions: {},
    colors: colors.value,
    tooltip: {
      y: {
        formatter: function (value: number) {
          return (
            value.toLocaleString() + (globalStore.displayInTons ? ' to' : ' kg')
          );
        },
      },
    },
  };
});

const sum = (data: number[]) => {
  return data.reduce((a, b) => a + b, 0);
};

/**
 * render the chart with prop data
 */
const renderChart = () => {
  try {
    colors.value = getMonochromeColorPalette(
      Object.keys(props.data.timeseries).length,
    );
    chartData.value = [];
    categories.value = [];
    // Check if props.data and timeseries exist and timeseries is not empty
    if (
      props.data &&
      props.data.timeseries &&
      Object.keys(props.data.timeseries).length > 0
    ) {
      const series = Object.keys(props.data.timeseries).map((key) => {
        return {
          x: key,
          y: round(
            toTons(sum(props.data.timeseries[key].map((entry) => entry.sum))),
          ),
        };
      });
      chartData.value = [
        {
          data: series,
        },
      ];

      categories.value = props.data.timeseries[
        Object.keys(props.data.timeseries)[0]
      ].map((entry) => entry.year.toString());
      if (categories.value.length === 3 && categories.value[0] === '1') {
        categories.value = ['Scope 1', 'Scope 2', 'Scope 3'];
      }

      colors.value = Object.keys(props.data.timeseries);
    }
  } catch (e) {
    console.warn('Error rendering chart', e);
  }
};

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true },
);

onMounted(() => {
  if (props.data || props.data) {
    renderChart();
  }
});
</script>
