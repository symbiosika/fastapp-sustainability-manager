<template>
  <Panel>
    <template #header>
      <div class="flex items-center justify-between header">
        <div>
          <span class="text-xl font-semibold dark:text-surface-400"
            >{{ title }}&nbsp;&nbsp;</span
          >
          <i
            class="fas fa-circle-info"
            v-tooltip.bottom="{
              value: titleDescription,
              pt: {
                arrow: {
                  style: {
                    borderBottomColor: 'var(--p-primary-color)',
                  },
                },
                text: '!bg-primary !text-primary-contrast !font-medium',
              },
            }"
          ></i>
        </div>
        <Dropdown
          v-if="isVariant"
          v-model="selectedValue"
          :options="selectOptions"
          option-label="label"
          option-value="value"
          placeholder="Select an option"
        />
      </div>
    </template>
    <div class="flex justify-between mt-8">
      <div class="flex items-center text-3xl font-bold">
        <span>{{ value }}</span>
      </div>
      <div class="flex flex-col" v-if="isVariant">
        <span v-if="upValue" class="mb-1 text-red-500 text-lg">
          + {{ upValue }}%&nbsp;&nbsp;<i class="fas fa-arrow-up"></i
        ></span>
        <span v-if="dropValue" class="mb-1 text-green-500 text-lg">
          - {{ dropValue }}%&nbsp;&nbsp;<i class="fas fa-arrow-down"></i
        ></span>
        <span
          >than last
          {{
            selectOptions.find(
              (option: DropOptions) => option.value === selectedValue,
            )?.label
          }}</span
        >
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import Panel from 'primevue/panel';
import Dropdown from 'primevue/dropdown';

interface DropOptions {
  label: string;
  value: string | number;
}

const props = defineProps({
  title: {
    type: String,
    default: 'Title',
  },
  isVariant: {
    type: Boolean,
    default: true,
  },
  titleDescription: {
    type: String,
    default: 'This is title description',
  },
  selectOptions: {
    type: Array as PropType<DropOptions[]>,
    default: () => [
      {
        label: '1 week',
        value: '7',
      },
      {
        label: '2 week',
        value: '14',
      },
      {
        label: '3 week',
        value: '21',
      },
      {
        label: '1 month',
        value: '30',
      },
    ],
  },
  value: {
    type: String,
    default: '5 t Co2',
  },
  dropValue: {
    type: String,
    default: '5.5',
  },
  upValue: {
    type: String,
    default: '',
  },
  selectValue: {
    type: [String, Number] as PropType<string | number>,
    default: '7',
  },
});

const selectedValue = ref(props.selectValue);
</script>

<style>
.header {
  width: 100%;
}
</style>
