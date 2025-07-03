<template>
  <div class="action-card p-2" @click="onClick">
    <div class="flex items-center justify-between">
      <span
        class="text-sm font-semibold dark:text-surface-400 overflow-hidden text-ellipsis"
        v-tooltip.bottom="tooltipOptions(`Action Name: ${title}`)"
      >
        {{ title }}
      </span>
      <div class="flex items-center">
        <i
          v-for="(icon, index) in icons"
          :key="index"
          :class="icon.class"
          class="action-card-icon"
          @click.stop="icon.handler"
          v-tooltip.bottom="tooltipOptions(icon.tooltip)"
        />
      </div>
    </div>
    <span
      class="text-xs font-medium dark:text-surface-100"
      v-tooltip.bottom="tooltipOptions('Completion Date')"
    >
      {{ date }}
    </span>
    <p
      class="text-xs font-regular action-card-description overflow-hidden text-ellipsis"
      v-tooltip.bottom="tooltipOptions('Description')"
    >
      {{ description }}
    </p>
    <div class="flex items-center justify-between mt-5">
      <span
        class="inline-block bg-blue-500 text-white text-xs font-regular px-1 py-1 rounded"
        v-tooltip.bottom="tooltipOptions('Status')"
      >
        {{ status }}
      </span>
      <div
        class="w-7 h-7 text-xs rounded-full flex items-center justify-center text-white font-bold"
        :style="{ backgroundColor: '#567455' }"
        v-tooltip.bottom="tooltipOptions(personName)"
      >
        {{ getFirstAndLastChar(personName) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

// Define props with default values
const props = defineProps({
  title: { type: String, default: 'Action Title' },
  date: { type: String, default: '16/09/2024' },
  description: {
    type: String,
    default:
      'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
  },
  status: { type: String, default: 'Pending' },
  personName: { type: String, default: 'William Gates' },
  onDelete: { type: Function as PropType<() => void>, default: () => {} },
  onEdit: { type: Function as PropType<() => void>, default: () => {} },
  onCopy: { type: Function as PropType<() => void>, default: () => {} },
  onClick: { type: Function as PropType<() => void>, default: () => {} },
});

// Action icons and their properties
const icons = [
  { class: 'fas fa-trash', tooltip: 'Delete', handler: props.onDelete },
  { class: 'fas fa-copy', tooltip: 'Copy', handler: props.onCopy },
  { class: 'fas fa-edit', tooltip: 'Edit', handler: props.onEdit },
];

// Helper function for tooltips
const tooltipOptions = (text: string) => ({
  value: text,
  pt: {
    arrow: {
      style: {
        borderBottomColor: 'var(--p-primary-color)',
      },
    },
    text: '!bg-primary !text-xs !text-primary-contrast !font-medium',
  },
  size: 'small',
});

// Function to get the first and last character of a name
const getFirstAndLastChar = (input: string): string => {
  const words = input.trim().split(' ');
  const firstWord = words[0] || '';
  const lastWord = words[words.length - 1] || '';
  return (
    firstWord.charAt(0) + (firstWord !== lastWord ? lastWord.charAt(0) : '')
  );
};

// Extract props for easier usage
const { onClick } = props;
</script>

<style scoped>
.action-card {
  width: 220px;
  max-width: 100%;
  border-radius: 8px;
  box-shadow:
    rgba(0, 0, 0, 0.05) 0px 0px 0px 1px,
    rgb(209, 213, 219) 0px 0px 0px 1px inset;
  border-left: 3px solid #567455;
  cursor: pointer;
}

.action-card-icon {
  transform: scale(0.9);
  cursor: pointer;
  color: #567455;
  padding: 5px;
}

.action-card-icon:hover {
  border-radius: 4px;
  background: #567455;
  color: white;
}

.action-card-icon:hover:first-child {
  background: red;
}

.action-card-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
