<template>
  <!-- Facility editor -->
  <Dialog
    id="edit-create-input"
    v-model:visible="showFacilityDialog"
    modal
    :header="
      selectedFacility?.id === 'new'
        ? t('facilities.create')
        : t('facilities.edit')
    "
    :class="{
      'w-2/4': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <template v-if="selectedFacility">
      <FacilityItem v-model="selectedFacility" />
      <div class="mt-3">
        <Button
          :label="
            selectedFacility?.id === 'new'
              ? t('facilities.create')
              : t('facilities.save')
          "
          @click="saveFacility"
        />
      </div>
    </template>
  </Dialog>

  <DataTable
    :showGridlines="false"
    v-if="data != null && data.length > 0"
    :value="data"
    class="cst-no-hover"
    :selection-mode="'single'"
    v-model:selection="selectedValue"
    key="id"
    scrollHeight="300px"
  >
    <Column selectionMode="single" headerStyle="width: 3rem"></Column>
    <Column
      field="name"
      :header="$t('facilities.facilityChooser.name')"
    ></Column>
    <Column
      field="manufacturer"
      :header="$t('facilities.facilityChooser.manufacturer')"
    ></Column>
    <Column
      field="model"
      :header="$t('facilities.facilityChooser.model')"
    ></Column>
  </DataTable>
</template>

<script setup lang="ts">
import { FacilityEntry } from '../../services/types';
import { PropType, Ref, ref, watch } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { getEmtypFacility } from '../../factory/facility';
import { useI18n } from 'vue-i18n';
import { error, info } from '../../services/ui/toast';
import FacilityItem from './FacilityItem.vue';

// load global references
const global = useGlobalStore();
const { t } = useI18n();
const windowWidth = ref(window.innerWidth);

const emits = defineEmits(['update:modelValue', 'update:triggerAddFacility']);
const props = defineProps({
  modelValue: {
    type: String as PropType<null | string>,
    required: false,
  },
  triggerAddFacility: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const selectedValue: Ref<null | FacilityEntry> = ref(null);
watch(
  () => selectedValue.value,
  () => {
    if (selectedValue.value == null) {
      return;
    }
    emits('update:modelValue', selectedValue.value.id);
  },
);

watch(
  () => props.triggerAddFacility,
  (value) => {
    if (value) {
      addFacilityToDialog();
    }
  },
);

// main data for table
const data: Ref<FacilityEntry[]> = ref([]);

/**
 * Get all data
 */
const getData = async () => {
  await global.refreshFacilities();
  const filtered = global.facilities.filter(
    (f) => f.shutdownDate == null || f.shutdownDate === '',
  );
  data.value = filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (props.modelValue != null) {
    const entry = global.facilitiesDict[props.modelValue] ?? null;
    if (entry != null) {
      selectedValue.value = entry;
    }
  }
};

const selectedFacility = ref<null | FacilityEntry>(null);
const showFacilityDialog = ref(false);

/**
 * Save the facility
 */
const saveFacility = async () => {
  if (!selectedFacility.value) return;

  try {
    if (selectedFacility.value.id === 'new') {
      await global.addFacility(selectedFacility.value);
    } else {
      await global.updateFacility(selectedFacility.value);
    }
    showFacilityDialog.value = false;
    getData();
    info(t('facilities.saved'));
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

/**
 * Add a new facility
 */
const addFacilityToDialog = () => {
  selectedFacility.value = getEmtypFacility(global.selectedSite?.id ?? '');
  showFacilityDialog.value = true;
  emits('update:triggerAddFacility', false);
};

/**
 * Init
 */
getData();
</script>

<style>
.cst-no-hover > * > * > .p-datatable-tbody > tr:focus {
  outline: none !important;
}
</style>
