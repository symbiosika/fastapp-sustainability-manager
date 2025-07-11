<template>
  <Card>
    <template #header>
      <div class="psm-report-header">
        <h3>{{ $t('actions.overviewTab.heading') }}</h3>
      </div>
    </template>
    <template #content>
      <Dialog
        :header="`${$t('actions.overviewTab.characteristicsDialogPrefix')} ${
          selectedAction?.name
        }`"
        v-model:visible="actionCharacteristicsVisible"
        class="action-overview__dialog"
      >
        <ActionCharacteristics v-if="selectedAction" :action="selectedAction" />
      </Dialog>

      <template v-if="Object.keys(categorySumDict).length > 0">
        <div class="flex">
          <ApexGaugeWrapper
            v-for="cat in Object.keys(categorySumDict)"
            :key="cat"
            :label="cat"
            :data="Math.round(categorySumDict[cat].precentagePart)"
            unit="%"
          />
        </div>
      </template>

      <DataTable
        :value="actions"
        class="mt-5"
        :showGridlines="false"
        v-if="actions.length > 0"
      >
        <Column :header="$t('actions.charTable.year')">
          <template #body="{ data }">
            <span class="flex justify-end text-right font-bold">
              <span
                v-if="
                  data.finishedUntilIs != null && data.finishedUntilIs != ''
                "
              >
                {{ dateToYear(data.finishedUntilIs) }}
              </span>
              <span v-else>
                {{ dateToYear(data.finishedUntilPlanned) }}
              </span>
            </span>
          </template>
        </Column>
        <Column field="name" :header="$t('actions.table.name')"></Column>
        <Column :header="$t('actions.descriptionTarget')">
          <template #body="{ data }">
            <div class="flex content-center flex-wrap">
              <span
                v-html="data.descriptionTargetValue"
                style="cursor: pointer"
                class="hover:text-blue-500"
                @click="
                  selectedAction = data;
                  actionCharacteristicsVisible = true;
                "
              ></span>
            </div>
          </template>
        </Column>
        <Column
          field="category"
          :header="$t('actions.charTable.category')"
        ></Column>
        <Column :header="$t('actions.table.status')">
          <template #body="{ data }">
            <ProgressBarWithTarget
              v-if="data.progress < 100"
              color="grey"
              :value="data.targetValuePlanned"
              :targetValue="data.targetValuePlanned"
            >
            </ProgressBarWithTarget>

            <ProgressBarWithTarget
              v-else
              :color="Config.colors.data2"
              :value="data.targetValueIs"
              :targetValue="data.targetValueIs"
            >
            </ProgressBarWithTarget>
          </template>
        </Column>
        <Column :header="$t('actions.table.amount')">
          <template #body="{ data }">
            <span class="flex justify-end text-right">
              <nobr v-if="data.progress < 100">
                {{ toTons(data.targetValueAbsolutPlanned).toLocaleString() }}
                to
              </nobr>
              <nobr v-else>
                {{ toTons(data.targetValueAbsolutIs) }}/{{
                  toTons(data.targetValueAbsolutPlanned)
                }}
                to
              </nobr>
            </span>
          </template>
        </Column>
      </DataTable>
      <div v-else>
        <p>{{ $t('report.noActions') }}</p>
      </div>
    </template>
  </Card>

  <Card class="mt-3">
    <template #header>
      <div class="psm-report-header">
        <h3>{{ $t('actions.overviewTab.roadmap') }}</h3>
      </div>
    </template>
    <template #content>
      <action-dumbbell-chart-wrapper
        v-if="actions.length > 0"
        :actions="actions"
      />
      <div v-else>
        <p>{{ $t('report.noActions') }}</p>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import dataprovider from '../../../services/dataprovider';
import { ref, Ref, onMounted } from 'vue';
import { ActionEntry, ActionWithPercentage } from '../../../services/types';
import { useGlobalStore } from '../../../stores/global';
import { dateToYear, toTons } from '../../../services/helper/index';
import ProgressBarWithTarget from '../../dashboard/plot/custom/ProgressBarWithTarget.vue';
import ActionCharacteristics from './ActionCharacteristics.vue';
import ApexGaugeWrapper from '../../dashboard/plot/apex/ApexGaugeWrapper.vue';
import ActionDumbbellChartWrapper from './ActionDumbbellChartWrapper.vue';
import Config from '../../../config';

const global = useGlobalStore();
const actionCharacteristicsVisible = ref(false);
const selectedAction = ref<ActionEntry | null>(null);

interface ActionCategorySumDict {
  [key: string]: {
    sumAbsolute: number; // if entry is not finished then the planned value is used
    precentagePart: number;
  };
}

const actions: Ref<ActionWithPercentage[]> = ref([]);
const categorySumDict: Ref<ActionCategorySumDict> = ref({});

const getData = async () => {
  try {
    if (!global.selectedReport) {
      console.error('No report selected');
      return;
    }
    const acts = await dataprovider.readActions();
    // order by date. if "finishedUntilIs" is null or empty then use "finishedUntilPlanned"
    // both can be string, Date or null or ""
    acts.sort((a, b) => {
      const aDate = a.finishedUntilIs ?? a.finishedUntilPlanned;
      const bDate = b.finishedUntilIs ?? b.finishedUntilPlanned;
      if (aDate == null || aDate === '') {
        return 1;
      }
      if (bDate == null || bDate === '') {
        return -1;
      }
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

    // calulate sum of all planned target values
    const sumPlanned = acts.reduce(
      (acc, act) => acc + (act.targetValueAbsolutPlanned ?? 0),
      0,
    );
    // calulate sum of all actual target values
    const sumIs = acts.reduce(
      (acc, act) => acc + (act.targetValueAbsolutIs ?? 0),
      0,
    );
    const biggerValue = sumPlanned > sumIs ? sumPlanned : sumIs;

    // add a precentage value to each action for planned and actual target value
    // also group all entries by category and creat a dictionary with the sum of all planned and actual target values
    const actsWithPercentage: ActionWithPercentage[] = acts.map((act) => {
      const plannedPercentage =
        (act.targetValueAbsolutPlanned / biggerValue) * 100;
      const isPercentage = (act.targetValueAbsolutIs / biggerValue) * 100;

      // add the planned and actual target value to the category dictionary
      if (categorySumDict.value[act.category]) {
        categorySumDict.value[act.category].sumAbsolute +=
          act.progress < 100
            ? act.targetValueAbsolutPlanned
            : act.targetValueAbsolutIs;
      } else {
        categorySumDict.value[act.category] = {
          sumAbsolute:
            act.progress < 100
              ? act.targetValueAbsolutPlanned
              : act.targetValueAbsolutIs,
          precentagePart: 0,
        };
      }

      return {
        ...act,
        targetValuePlanned: plannedPercentage,
        // relation between the target value ant the real value
        targetValueIs: isPercentage,
      };
    });

    // calculate the percentage part of each category.
    const sum = Object.values(categorySumDict.value).reduce(
      (acc, cat) => acc + cat.sumAbsolute,
      0,
    );
    for (const key in categorySumDict.value) {
      categorySumDict.value[key].precentagePart =
        (categorySumDict.value[key].sumAbsolute / sum) * 100;
    }

    actions.value = actsWithPercentage;
  } catch (e) {
    console.error(e);
  }
};
onMounted(async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  await getData();
});
</script>

<style lang="scss">
.action-overview {
  &__dialog {
    width: 95%;
    max-width: 80rem;
  }
}
.p-dialog-title {
  color: var(--primary-color);
}
</style>
