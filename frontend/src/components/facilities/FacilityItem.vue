<template>
  <div>
    <GenericForm :definition="formEntries" v-model="internalFacility" />
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import * as v from 'valibot';
import { FacilityEntry } from '@/services/types';
import { GenericFormEntry } from '@/services/types/form';
import GenericForm from '@/components/forms/GenericForm.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props and emits
const props = defineProps({
  modelValue: {
    type: Object as () => FacilityEntry,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const internalFacility = ref<FacilityEntry>(
  JSON.parse(JSON.stringify(props.modelValue)),
);

const facilityEntrySchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  manufacturer: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  model: v.pipe(v.string(), v.maxLength(255)),
  description: v.pipe(v.string(), v.maxLength(255)),
  shutdownDate: v.nullable(v.date()),
});

const formEntries: GenericFormEntry[] = [
  {
    label: t('facilities.name') + '*',
    key: 'name',
    type: 'text',
    required: true,
    validation: v.pick(facilityEntrySchema, ['name']),
  },
  {
    label: t('facilities.manufacturer') + '*',
    key: 'manufacturer',
    type: 'text',
    required: true,
    validation: v.pick(facilityEntrySchema, ['manufacturer']),
  },
  {
    label: t('facilities.model'),
    key: 'model',
    type: 'text',
    validation: v.pick(facilityEntrySchema, ['model']),
  },
  {
    label: t('facilities.description'),
    key: 'description',
    type: 'textarea',
    validation: v.pick(facilityEntrySchema, ['description']),
  },
  {
    label: t('facilities.facilityShutdownDate'),
    key: 'shutdownDate',
    type: 'date',
    validation: v.pick(facilityEntrySchema, ['shutdownDate']),
  },
];

// Sync the internal facility value with the parent via v-model
watch(
  () => internalFacility.value,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true },
);

// Watch for external changes to the modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    internalFacility.value = JSON.parse(JSON.stringify(newValue));
  },
  { deep: true },
);
</script>
