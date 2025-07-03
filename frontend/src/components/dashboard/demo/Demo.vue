<template>
  <h2>{{ t('demo.dashboardDemo') }}</h2>

  <!-- Form for query -->
  <div>
    <HorizontalTwoColHeader :label="t('demo.main')" class="mt-2" />

    <HorizontalTwoColEntry :label="t('demo.project')" class="mt-2">
      <label>{{ global.selectedProject?.name }}</label>
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry :label="t('demo.chooseSites')" class="mt-2">
      <MultiSelect
        id="sites"
        :options="global.sites"
        v-model="selectedSiteIds"
        option-label="name"
        option-value="id"
        :placeholder="t('demo.selectSite')"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry :label="t('demo.chooseYears')" class="mt-2">
      <MultiSelect
        id="years"
        :options="availableYears"
        v-model="selectedYears"
        :placeholder="t('demo.selectYear')"
        class="w-full"
      />
    </HorizontalTwoColEntry>

    <!-- Form for filters -->
    <HorizontalTwoColHeader :label="t('demo.filters')" class="mt-2" />
    <HorizontalTwoColEntry :label="t('demo.useFilter')" class="mt-2">
      <Checkbox v-model="useFilter" id="Use Filter" :binary="true" />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry :label="t('demo.scopes')" class="mt-2">
      <MultiSelect
        id="scopes"
        :options="[1, 2, 3]"
        v-model="selectedScopes"
        :placeholder="t('demo.selectScope')"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry :label="t('demo.categories')" class="mt-2">
      <MultiSelect
        id="categories"
        :options="availableCategories"
        v-model="selectedCategories"
        :placeholder="t('demo.selectCategory')"
        :maxSelectedLabels="1"
        display="chip"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry :label="t('demo.facilities')" class="mt-2">
      <MultiSelect
        id="facilities"
        :options="availableFacilities"
        option-label="name"
        option-value="name"
        v-model="selectedFacilities"
        :placeholder="t('demo.selectFacility')"
        class="w-full"
      />
    </HorizontalTwoColEntry>

    <!-- Form for function -->
    <HorizontalTwoColHeader :label="t('demo.aggregationType')" class="mt-2" />
    <HorizontalTwoColEntry :label="t('demo.function')" class="mt-2">
      <Dropdown
        id="function"
        :options="availableFunctions"
        option-label="name"
        option-value="id"
        v-model="selectedFunction"
        :placeholder="t('demo.selectFunction')"
        class="w-full"
      />
    </HorizontalTwoColEntry>
    <HorizontalTwoColEntry
      v-show="selectedFunction !== 'getPlainReportData'"
      :label="t('demo.groupBy')"
      class="mt-2"
    >
      <Dropdown
        id="groupBy"
        :options="availableGroupBy"
        v-model="selectedGroupBy"
        :placeholder="t('demo.groupByQuestion')"
        class="w-full"
      />
    </HorizontalTwoColEntry>

    <HorizontalTwoColEntry
      v-show="selectedFunction !== 'getPlainReportData'"
      :label="t('demo.stackedCharts')"
    >
      <Checkbox v-model="stackedCharts" id="stackedCharts" :binary="true" />
    </HorizontalTwoColEntry>

    <HorizontalTwoColEntry :label="t('demo.horizontalBars')">
      <Checkbox
        v-model="horizontalCharts"
        id="horizontalCharts"
        :binary="true"
      />
    </HorizontalTwoColEntry>

    <HorizontalTwoColEntry label="" class="mt-2">
      <div class="w-full flex justify-end">
        <Button @click="getData()" :label="t('demo.getData')" />
      </div>
    </HorizontalTwoColEntry>
  </div>

  <!-- RESULTS -->
  <TabView class="mt-2">
    <!-- Plot result -->
    <TabPanel :header="t('demo.plotData')">
      <div v-if="selectedFunction === 'getPlainReportData'">
        <Card>
          <template #content>
            {{ t('demo.cannotPlot') }}
          </template>
        </Card>
      </div>
      <TabView v-else>
        <TabPanel :header="t('demo.barChart')">
          <ApexChartWrapper
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            type="bar"
            :data="reportDataGrouped"
            :stacked="stackedCharts"
            :horizontal="horizontalCharts"
          />
          <ApexGroupedChartWrapper
            :key="chartKey"
            v-if="
              selectedFunction === 'getYearlyGroupedReportData' &&
              reportDataYearlyGrouped
            "
            :data="reportDataYearlyGrouped"
            :stacked="stackedCharts"
            :horizontal="horizontalCharts"
          />
        </TabPanel>
        <TabPanel :header="t('demo.lineChart')">
          <ApexChartWrapper
            :key="chartKey"
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            :type="stackedCharts ? 'area' : 'line'"
            :data="reportDataGrouped"
            :stacked="stackedCharts"
            :horizontal="horizontalCharts"
          />
          <p v-else>
            {{ t('demo.lineChartWarning') }}
          </p>
        </TabPanel>
        <TabPanel :header="t('demo.radarChart')">
          <ApexSumChartWrapper
            :key="chartKey"
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            type="radar"
            :data="reportDataGrouped"
          />
          <p v-else>
            {{ t('demo.radarChartWarning') }}
          </p>
        </TabPanel>
        <TabPanel :header="t('demo.pieChart')">
          <ApexSumChartWrapper
            :key="chartKey"
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            type="pie"
            :data="reportDataGrouped"
          />
          <p v-else>
            {{ t('demo.pieChartWarning') }}
          </p>
        </TabPanel>
        <TabPanel :header="t('demo.poleAreaChart')">
          <ApexSumChartWrapper
            :key="chartKey"
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            type="polarArea"
            :data="reportDataGrouped"
          />
          <p v-else>
            {{ t('demo.poleAreaChartWarning') }}
          </p>
        </TabPanel>
        <TabPanel :header="t('demo.treeMap')">
          <ApexTreemapWrapper
            :key="chartKey"
            v-if="
              selectedFunction === 'getGroupedReportData' && reportDataGrouped
            "
            :data="reportDataGrouped"
          />
          <p v-else>
            {{ t('demo.treeMapChartWarning') }}
          </p>
        </TabPanel>
      </TabView>
    </TabPanel>

    <!-- Data result -->
    <TabPanel :header="t('demo.data')">
      <Card class="mb-2">
        <template #content>
          <p>
            {{ t('demo.reportingEngine') }}
          </p>
          <p v-if="selectedFunction === 'getPlainReportData'">
            {{ t('demo.getPlainReportData') }}
          </p>
          <p v-else-if="selectedFunction === 'getGroupedReportData'">
            {{ t('demo.getGroupedReportData') }}
          </p>
        </template>
      </Card>
      <DemoShowCase
        v-if="selectedFunction === 'getPlainReportData' && plainData"
        :query="plainDataQuery"
        :result="plainData"
      />
      <DemoShowCase
        v-if="selectedFunction === 'getGroupedReportData' && reportDataGrouped"
        :query="plainDataQuery"
        :result="reportDataGrouped"
      />
      <DemoShowCase
        v-if="
          selectedFunction === 'getYearlyGroupedReportData' &&
          reportDataYearlyGrouped
        "
        :query="plainDataQuery"
        :result="reportDataYearlyGrouped"
      />
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import {
  getPlainReportData,
  ReportTimeseriesQuery,
  getGroupedReportData,
  getYearlyGroupedReportData,
  ReportGroupBy,
  TimeseriesDataEntry,
  AggregatedReportResult,
  AggregatedReportResultYearlyGrouped,
} from '../../../services/reporting/index';
import { ref, Ref, computed, ComputedRef, watch } from 'vue';
import DemoShowCase from './DemoShowCase.vue';
import HorizontalTwoColEntry from '../../forms/HorizontalTwoColEntry.vue';
import HorizontalTwoColHeader from '../../forms/HorizontalTwoCoHeader.vue';
import { useGlobalStore } from '../../../stores/global';
import ApexChartWrapper from '../plot/apex/ApexChartWrapper.vue';
import ApexGroupedChartWrapper from '../plot/apex/ApexGroupedChartWrapper.vue';
import ApexSumChartWrapper from '../plot/apex/ApexSumChartWrapper.vue';
import ApexTreemapWrapper from '../plot/apex/ApexTreemapWrapper.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// get necessary data (project, sites, reports) from store
const global = useGlobalStore();

// a list of the last 5 years dynamically generated
const availableYears = ref(
  Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
);

// a lost of all categories
const availableCategories = computed(() => {
  return global.equivalentFilters.category.all;
});

const availableFacilities = computed(() => {
  return global.facilities;
});

const availableFunctions = [
  { name: 'Plain Report Data as timeseries', id: 'getPlainReportData' },
  { name: 'Report Data (simple grouped)', id: 'getGroupedReportData' },
  {
    name: 'Report Data (grouped by Year and Key)',
    id: 'getYearlyGroupedReportData',
  },
];

// users choice
const selectedSiteIds: Ref<string[]> = ref(global.sites.map((s) => s.id));
const selectedYears: Ref<number[]> = ref(availableYears.value);
const useFilter: Ref<boolean> = ref(true);
// users filter
const selectedScopes: Ref<number[]> = ref([1, 2, 3]);
const selectedCategories: Ref<string[]> = ref([]);
const selectedFacilities: Ref<string[]> = ref([]);
// users choice of function
const selectedFunction: Ref<string> = ref('getGroupedReportData');
// users choice of groupBy
const availableGroupBy: ReportGroupBy[] = ['scope', 'category', 'facility'];
const selectedGroupBy: Ref<ReportGroupBy> = ref('scope');

// chart options
const stackedCharts = ref(false);
const horizontalCharts = ref(false);

const chartKey = ref(0);

/**
 * Build the query for the report
 */
const plainDataQuery: ComputedRef<ReportTimeseriesQuery> = computed(() => {
  return {
    projectId: global.selectedProject?.id || '',
    siteIds: selectedSiteIds.value,
    filter: {
      scope:
        useFilter.value && selectedScopes.value.length > 0
          ? selectedScopes.value
          : undefined,
      category:
        useFilter.value && selectedCategories.value.length > 0
          ? selectedCategories.value
          : undefined,
      facility:
        useFilter.value && selectedFacilities.value.length
          ? selectedFacilities.value
          : undefined,
      years: selectedYears.value,
    },
  };
});

/**
 * The result of the query
 */
const plainData: Ref<null | TimeseriesDataEntry[]> = ref(null);
const reportDataGrouped: Ref<null | AggregatedReportResult> = ref(null);
const reportDataYearlyGrouped: Ref<null | AggregatedReportResultYearlyGrouped> =
  ref(null);

/**
 * This function is called when the user clicks the button to get the data.
 */
const getData = async () => {
  if (selectedFunction.value === 'getPlainReportData') {
    plainData.value = await getPlainReportData(plainDataQuery.value);
  } else if (selectedFunction.value === 'getGroupedReportData') {
    reportDataGrouped.value = await getGroupedReportData(
      plainDataQuery.value,
      selectedGroupBy.value,
    );
  } else if (selectedFunction.value === 'getYearlyGroupedReportData') {
    reportDataYearlyGrouped.value = await getYearlyGroupedReportData(
      plainDataQuery.value,
      selectedGroupBy.value,
    );
  }
};

watch([plainData, reportDataGrouped, reportDataYearlyGrouped], () => {
  chartKey.value += 1; // Increment key to force re-render
});
</script>
