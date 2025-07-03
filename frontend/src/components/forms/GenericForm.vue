<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="(entry, index) in definition"
      :key="index"
      class="flex flex-col gap-2"
    >
      <!-- Two Column Layout -->
      <template v-if="entry.type === 'two-col-layout'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(childEntry, childIndex) in entry.childs"
            :key="`child-${childIndex}`"
            class="flex flex-col"
          >
            <GenericForm v-model="model" :definition="[childEntry]" />
          </div>
        </div>
      </template>

      <!-- Adjusted Two Column Layout for mobile-first single column -->
      <template v-if="entry.type === 'two-col-flexible-layout'">
        <div
          class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2"
        >
          <div
            :class="{
              'flex-auto': entry.grow === 'left',
              'md:flex-none': entry.grow === 'right',
              'md:grow': entry.grow === 'left',
            }"
          >
            <GenericForm v-model="model" :definition="[entry.childs[0]]" />
          </div>
          <div
            :class="{
              'flex-auto': entry.grow === 'right',
              'md:flex-none': entry.grow === 'left',
              'md:grow': entry.grow === 'right',
            }"
          >
            <GenericForm v-model="model" :definition="[entry.childs[1]]" />
          </div>
        </div>
      </template>

      <template v-if="entry.type === 'flexible-row-layout'">
        <div
          class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2"
        >
          <div
            v-for="(childEntry, childIndex) in entry.childs"
            :key="`child-${childIndex}`"
            :class="{
              'md:grow': entry.grow[childIndex],
            }"
          >
            <GenericForm v-model="model" :definition="[childEntry]" />
          </div>
        </div>
      </template>

      <!-- Two Column Label-Value Entry -->
      <template v-if="entry.type === 'two-col-label-value'">
        <div class="flex flex-row gap-4">
          <label :for="`field-${entry.child.key}`" class="w-1/2">
            <span v-html="entry.child.label"></span>
          </label>
          <div class="w-1/2">
            <component
              :is="entry.child.type"
              :entry="entry.child"
              :model="model"
            />
          </div>
        </div>
      </template>

      <!-- Section-Header -->
      <template v-if="entry.type === 'section-header'">
        <div class="w-full">
          <h3 class="text-lg font-bold">
            {{ entry.header }}
          </h3>
        </div>
      </template>

      <template v-if="isNotLayoutType(entry) && !objectIsHidden(entry)">
        <label :for="`field-${entry.key}`" class="w-full" v-if="entry.label">
          <span v-html="entry.label"></span>
          <span v-if="entry.info">
            <i
              class="ml-1 fa-solid fa-info-circle text-gray-400"
              v-tooltip="entry.info"
            />
          </span>
        </label>
      </template>

      <template v-if="objectIsHidden(entry)">
        <!-- Do nothing -->
      </template>

      <!-- Main switch depending on type -->

      <template v-else-if="entry.type === 'text' || entry.type === 'password'">
        <InputText
          v-model="plainValueHolder[entry.key]"
          :style="
            (entry.settings?.width ? `width: ${entry.settings.width};` : '') +
            (entry.settings?.bold ? 'font-weight: bold;' : '')
          "
          :id="`field-${entry.key}`"
          class="w-full"
          :type="entry.type"
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
          :placeholder="entry.settings?.placeholder ?? undefined"
          :invalid="!validated[entry.key].valid"
          :disabled="entry.disabled ?? false"
        />
      </template>

      <template v-else-if="entry.type === 'number'">
        <InputNumber
          v-model="plainValueHolder[entry.key]"
          :style="
            (entry.settings?.width ? `width: ${entry.settings.width};` : '') +
            (entry.settings?.bold ? 'font-weight: bold;' : '')
          "
          :id="`field-${entry.key}`"
          :invalid="!validated[entry.key].valid"
          :suffix="entry.settings?.suffix ?? ''"
          :use-grouping="entry.settings?.thousandSeparator ?? true"
          :min="entry.settings?.min ?? undefined"
          :max="entry.settings?.max ?? undefined"
          pt:root:class="border-red-600"
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
          :disabled="entry.disabled ?? false"
        />
      </template>

      <template
        v-else-if="
          entry.type === 'date' ||
          entry.type === 'time' ||
          entry.type === 'datetime'
        "
      >
        <Calendar
          v-model="plainValueHolder[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full"
          :class="!validated[entry.key].valid ? 'invalid' : ''"
          :showTime="entry.type === 'datetime' || entry.type === 'time'"
          :hourFormat="
            entry.type === 'datetime' || entry.type === 'time'
              ? '24'
              : undefined
          "
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-else-if="entry.type === 'textarea'">
        <Editor
          v-model="model[entry.key]"
          :id="`field-${entry.key}`"
          editorStyle="height: 160px; width: 100%;"
          v-tooltip.bottom="{
            value: !validated[entry.key].valid
              ? validated[entry.key].message
              : entry.label,
            showDelay: 1000,
            hideDelay: 300,
          }"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-else-if="entry.type === 'select' && !entry.display">
        <Dropdown
          v-model="plainValueHolder[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full"
          :options="entry.options"
          :optionLabel="entry.optionsLabel"
          :optionValue="entry.optionsKey"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template
        v-else-if="entry.type === 'select' && entry.display === 'button'"
      >
        <SelectButton
          v-model="plainValueHolder[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full"
          :options="entry.options"
          :optionLabel="entry.optionsLabel"
          :optionValue="entry.optionsKey"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-else-if="entry.type === 'checkbox'">
        <Checkbox
          v-model="plainValueHolder[entry.key]"
          :id="`field-${entry.key}`"
          :binary="true"
          :invalid="!validated[entry.key].valid"
        />
      </template>

      <template v-else-if="entry.type === 'radio'">
        <div>
          <div
            v-for="option in entry.options"
            :key="option[entry.optionsKey ?? 'value']"
            class="field-radiobutton"
          >
            <RadioButton
              v-model="plainValueHolder[entry.key]"
              :inputId="`field-${entry.key}-${
                option[entry.optionsKey ?? 'value']
              }`"
              :value="option[entry.optionsKey ?? 'value']"
            />
            <label
              :for="`field-${entry.key}-${option[entry.optionsKey ?? 'label']}`"
              >{{ option[entry.optionsLabel ?? 'label'] }}</label
            >
          </div>
        </div>
      </template>

      <template v-else-if="entry.type === 'slider'">
        <Slider
          v-model="plainValueHolder[entry.key]"
          :id="`field-${entry.key}`"
          class="w-full mb-3"
          :step="5"
          :invalid="!validated[entry.key].valid"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type {
  FormEntry,
  GenericFormEntry,
  LayoutEntry,
} from '../../services/types/form';
import * as v from 'valibot';

const props = defineProps<{
  definition: GenericFormEntry[];
  modelValue: { [key: string]: any };
}>();

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

/**
 * a 1-level deep copy of the model value
 */
const plainValueHolder = ref(<any>{});

/**
 * Checker to identify layout types
 */
const isLayoutType = (entry: GenericFormEntry): entry is LayoutEntry =>
  entry.type === 'two-col-layout' ||
  entry.type === 'two-col-label-value' ||
  entry.type === 'two-col-flexible-layout' ||
  entry.type === 'flexible-row-layout' ||
  entry.type === 'section-header';

const isNotLayoutType = (entry: GenericFormEntry): entry is FormEntry =>
  !isLayoutType(entry);

/**
 * valibot validation
 */
const check = (
  entry: FormEntry,
  value: any,
): { valid: boolean; message: string } => {
  if (isLayoutType(entry)) return { valid: true, message: '' };

  if (!entry.validation) return { valid: true, message: '' };
  try {
    const singleObject = { [entry.key]: value };
    v.parse(entry.validation, singleObject);
    return { valid: true, message: '' };
  } catch (err) {
    return { valid: false, message: (err + '')?.replace('ValiError: ', '') };
  }
};

/**
 * Get value from an object by its path
 */
const getValueByPath = (obj: any, path: string) => {
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

/**
 * Set value in an object by its path
 */
const setValueByPath = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const lastObj = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
  lastObj[lastKey!] = value;
};

/**
 * Get value from the model by its path
 */
const getNestedModelValue = (path: string) => {
  return getValueByPath(model.value, path);
};

/**
 * Return the values from the plain object to its original nested structure and emit the update
 */
const updateParent = () => {
  for (const entry of props.definition) {
    if (isLayoutType(entry)) continue;

    setValueByPath(model.value, entry.key, plainValueHolder.value[entry.key]);
  }
  emit('update:modelValue', model.value);
};

/**
 * Automatically update the parent model when the plain object changes
 */
watch(
  () => plainValueHolder.value,
  () => {
    updateParent();
  },
  { deep: true },
);

/**
 * Fill the plain object with the current model values
 */
const fillPlainValueHolder = () => {
  for (const entry of props.definition) {
    if (isLayoutType(entry)) continue;
    plainValueHolder.value[entry.key] = getNestedModelValue(entry.key);
  }
};
onMounted(fillPlainValueHolder);
watch(
  () => props.modelValue,
  () => {
    fillPlainValueHolder();
  },
  { deep: true },
);

/**
 * An object with all validation results that is computed on every change
 */
const validated = computed(() => {
  const result: { [key: string]: { valid: boolean; message: string } } = {};
  for (const entry of props.definition) {
    if (isLayoutType(entry)) continue;

    const value = getValueByPath(props.modelValue, entry.key);
    result[entry.key] = check(entry, value);
  }
  return result;
});

const objectIsHidden = (entry: GenericFormEntry) => {
  if (isLayoutType(entry)) return false;

  if (entry.hide) {
    if (entry.hide.operator === 'eq') {
      return getNestedModelValue(entry.hide.key) !== entry.hide.value;
    }
  }
  return false;
};
</script>

<style>
.p-editor-container[invalid='true'] {
  border: 1px solid #f87171;
  border-radius: 5px;
}

input.p-inputnumber-input {
  width: 100% !important; /* Adjust as needed */
  max-width: none !important; /* Ensure no max-width is limiting it */
}
</style>
