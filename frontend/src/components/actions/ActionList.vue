<template>
  <DataTable
    v-if="actions.length > 0"
    :value="filteredActions"
    class="cst-no-hover text-sm"
    :showGridlines="false"
  >
    <Column field="name" :header="$t('actions.table.name')"></Column>
    <Column field="status" :header="$t('actions.table.status')">
      <template #body="{ data }">
        {{ statusTranslations[data.status] || '' }}
      </template>
    </Column>
    <Column
      field="finishedUntilPlanned"
      :header="$t('actions.table.finishedUntilPlanned')"
    >
      <template #body="{ data }">
        <!-- formatiertes deutsches Datum -->
        {{ new Date(data.finishedUntilPlanned).getMonth() + 1 }}/{{
          new Date(data.finishedUntilPlanned).getFullYear()
        }}
      </template>
    </Column>
    <!-- <Column field="shortDescription" header="Kurzbeschreibung"></Column>
        <Column field="longDescription" header="Langbeschreibung"></Column> -->
    <Column
      field="targetValueAbsolutPlanned"
      :header="$t('actions.table.targetValueAbsolutePlanned')"
    >
      <template #body="{ data }">
        <Chip class="text-sm"
          >{{ toTons(data.targetValueAbsolutPlanned)
          }}{{ getGlobalUnit() }}</Chip
        >
      </template>
    </Column>
    <Column
      field="responsible"
      :header="$t('actions.table.responsible')"
    ></Column>
    <Column field="progress" :header="$t('actions.table.progress')">
      <template #body="{ data }">
        <Chip class="text-sm">{{ data.progress }}%</Chip>
      </template>
    </Column>
    <Column field="relevant" :header="$t('actions.table.relevant')">
      <template #body="{ data }">
        {{ data.relevant ? $t('actions.table.yes') : $t('actions.table.no') }}
      </template>
    </Column>
    <Column header="">
      <template #body="{ data }">
        <div class="flex">
          <Button
            icon="fa-solid fa-edit"
            @click="emit('edit', data)"
            v-tooltip.bottom="{
              value: $t('facilities.edit'),
              showDelay: 500,
              hideDelay: 300,
            }"
          />
          <Button
            icon="fa-solid fa-trash"
            class="ml-1"
            @click="emit('delete', data, $event)"
            v-tooltip.bottom="{
              value: $t('facilities.delete'),
              showDelay: 500,
              hideDelay: 300,
            }"
          />
          <Button
            icon="fa-solid fa-copy"
            class="ml-1"
            @click="emit('copy', data)"
            v-tooltip.bottom="{
              value: $t('facilities.copy'),
              showDelay: 500,
              hideDelay: 300,
            }"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ActionEntry } from '@/services/types';
import statusTranslations from '@/services/statusTranslations';
import { getGlobalUnit, toTons } from '@/services/helper';

const props = defineProps<{
  actions: ActionEntry[];
  filter: string;
  triggerRefresh?: boolean;
}>();
watch(
  () => props.actions,
  () => {
    filterData();
  },
);
watch(
  () => props.filter,
  () => {
    filterData();
  },
);
watch(
  () => props.triggerRefresh,
  () => {
    filterData();
    emit('update:triggerRefresh', false);
  },
);

const emit = defineEmits([
  'delete',
  'edit',
  'copy',
  'update:globalFilter',
  'update:triggerRefresh',
]);

/**
 * Filtered action list
 */
const filteredActions = ref<ActionEntry[]>([]);
const filterData = () => {
  let filtered = props.actions;
  if (props.filter && props.filter !== '') {
    filtered = props.actions.filter((item) => {
      return item.name.toLowerCase().includes(props.filter.toLowerCase());
    });
  }
  filteredActions.value = filtered;
};
</script>
