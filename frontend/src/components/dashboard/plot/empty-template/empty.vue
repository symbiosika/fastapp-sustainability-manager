<template>
  <div ref="chartContainer" class="flex justify-center"></div>
</template>

<script setup lang="ts">
// reference: https://observablehq.com/@d3/sankey/2

import { ref, onMounted, watch, PropType } from 'vue';
// import * as d3 from 'd3';
import { TimeseriesDataEntry } from '../../../../services/reporting';
// import { toTons, round } from '@/services/helper';
// import { getMonochromeColorPalette } from '@/services/colors';

const props = defineProps({
  data: {
    type: Array as PropType<TimeseriesDataEntry[]>,
    required: true,
  },
});

const chartContainer = ref<HTMLElement | null>(null);

const renderChart = () => {};

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
