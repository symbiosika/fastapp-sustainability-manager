<template>
  <h2>{{ $t('inputs.heading') }}</h2>

  <ScopeInfoBox v-if="preSelectedScope != 'all'" :scope="preSelectedScope" />

  <InlineMessage
    severity="info"
    v-if="globalStore.showTooltips"
    class="w-full mb-2"
  >
    {{ $t('inputs.inlineMsg') }}
  </InlineMessage>

  <div class="w-full p-3 mb-3">
    <MeterGroup :value="sumsByCategory" />
  </div>

  <Toolbar class="mb-2">
    <template #start>
      <template v-if="preSelectedScope === 'all'">
        <label class="ml-2">{{ $t('inputs.showScopes') }}:</label>
        <Checkbox
          id="scope1Active"
          v-model="filterScopes['1']"
          value="1"
          class="ml-3"
          :binary="true"
        />
        <label class="ml-1" for="scope1Active">1</label>
        <Checkbox
          id="scope2Active"
          v-model="filterScopes['2']"
          value="1"
          class="ml-4"
          :binary="true"
        />
        <label class="ml-1" for="scope2Active">2</label>
        <Checkbox
          id="scope3Active"
          v-model="filterScopes['3']"
          value="1"
          class="ml-4"
          :binary="true"
        />
        <label class="ml-1" for="scope3Active">3</label>
        <label class="ml-4" v-if="preSelectedFacility"
          >({{ $t('facilities.filterOnFacilityActive') }}: "{{
            globalStore.facilitiesDict[preSelectedFacility]?.name ?? ''
          }}")
        </label>
      </template>
      <span class="ml-4"
        >{{ $t('inputs.amount') }}:
        {{
          roundStringWithDecimals(
            globalStore.displayInTons ? toTons(sumValue) : sumValue,
            3,
          )
        }}{{ globalStore.displayInTons ? ' to' : ' kg' }}
      </span>
    </template>
    <template #end>
      <Button
        icon="fa-solid fa-wand-magic-sparkles"
        @click="
          selectedValue = clone(
            getEmptyInput(globalStore.selectedReport?.id ?? ''),
          );
          showComfortInput = true;
        "
        class="mr-1"
        v-tooltip.bottom="{
          value: $t('facilities.magic'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
      <Button
        icon="fa-solid fa-plus"
        @click="
          selectedValue = clone(
            getEmptyInput(globalStore.selectedReport?.id ?? ''),
          );
          showDialog = true;
        "
        class="mr-1"
        v-tooltip.bottom="{
          value: $t('facilities.add'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
      <Button
        icon="fa-solid fa-download"
        @click="download()"
        v-tooltip.bottom="{
          value: $t('facilities.download'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
    </template>
  </Toolbar>

  <!-- choose equivalent modal for non-comfort input -->
  <Dialog
    id="choose-equivalent"
    v-model:visible="showChooseEquivalent"
    modal
    :header="$t('inputs.chooseEquivalent')"
    :class="{
      'w-3/5': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <SmartEquivalentList
      v-model="selectedValue.equivalent"
      :filter-by="{
        scope: selectedValue.scope ? [selectedValue.scope] : [1, 2, 3],
      }"
      :hide-scope-input="preSelectedScope != 'all'"
    />
    <div class="mt-4">
      <Button
        :label="$t('inputs.ok')"
        @click="
          showChooseEquivalent = false;
          updateNameAndCategory();
        "
      />
      <Button
        class="ml-1"
        :label="$t('inputs.resetSelection')"
        @click="
          selectedValue.equivalent = null;
          showChooseEquivalent = false;
        "
      />
      <Button
        class="ml-1"
        :label="$t('inputs.cancel')"
        @click="
          selectedValue = originalValue;
          showChooseEquivalent = false;
        "
      />
    </div>
  </Dialog>

  <!-- choose facility modal -->
  <Dialog
    id="choose-facility"
    v-model:visible="showChooseFacility"
    modal
    header="Anlage auswählen"
    :class="{
      'w-3/5': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <FacilityChooser
      v-model="selectedValue.facility"
      v-model:triggerAddFacility="triggerAddANewFacility"
    />
    <div class="mt-4">
      <Button :label="$t('inputs.ok')" @click="showChooseFacility = false" />
      <Button
        class="ml-1"
        :label="$t('inputs.resetSelection')"
        @click="
          selectedValue.facility = null;
          showChooseFacility = false;
        "
      />
      <Button
        class="ml-1"
        :label="$t('facilities.add')"
        @click="triggerAddANewFacility = true"
      />
      <Button
        class="ml-1"
        :label="$t('inputs.cancel')"
        @click="
          selectedValue = originalValue;
          showChooseFacility = false;
        "
      />
    </div>
  </Dialog>

  <!-- comfort input -->
  <Dialog
    modal
    :header="$t('inputs.comfortInput')"
    id="create-input-comfort"
    v-model:visible="showComfortInput"
    :class="{ 'w-3/4': true }"
    maximizable
  >
    <WizardInputForm
      v-model:selectedValue="selectedValue"
      v-model:showChooseFacility="showChooseFacility"
      :preSelectedScope="preSelectedScope"
      @save="save"
    />
  </Dialog>

  <Dialog
    id="edit-create-input"
    v-model:visible="showDialog"
    modal
    :header="
      selectedValue.id === 'new' ? $t('inputs.create') : $t('inputs.edit')
    "
    :class="{
      'w-2/4': windowWidth > 990,
      'w-full': windowWidth < 990,
      'h-screen': windowWidth < 990,
    }"
  >
    <StandardInputForm
      v-model:selectedValue="selectedValue"
      v-model:showChooseEquivalent="showChooseEquivalent"
      v-model:showChooseFacility="showChooseFacility"
      :preSelectedScope="preSelectedScope"
    />

    <div class="mt-5 flex justify-end">
      <Button
        class="w-64"
        icon="fa-solid fa-check"
        :label="
          selectedValue.id === 'new' ? $t('inputs.create') : $t('inputs.save')
        "
        @click="save"
      />
    </div>
  </Dialog>

  <InputList
    :inputs="data"
    @edit="
      (data) => {
        selectedValue = data;
        originalValue = clone(data);
        showDialog = true;
      }
    "
    @delete="deleteEntry"
    :preSelectedScope="preSelectedScope"
    :preSelectedFacility="preSelectedFacility"
    :filter="filter"
    :filterScopes="filterScopes"
    :triggerRefresh="triggerRefresh"
  />
</template>

<script setup lang="ts">
import InputList from '@/components/inputs/InputList.vue';
import SmartEquivalentList from '@/components/equivalents/SmartEquivalentList.vue';
import FacilityChooser from '@/components/facilities/FacilityChooser.vue';
import ScopeInfoBox from '@/components/equivalents/ScopeInfoBox.vue';
import { InputEntry } from '../../services/types';
import { Ref, ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { error } from '../../services/ui/toast';
import { useConfirm } from 'primevue/useconfirm';
import { round, roundStringWithDecimals, toTons } from '../../services/helper';
import { MeterItem } from 'primevue/metergroup';
import { getMonochromeColorPalette } from '@/services/colors';
import { globalStore, inputStore } from '@/main';
import * as v from 'valibot';
import { getEmptyInput } from '@/factory/input';
import { getInputsAsCsv } from '@/services/csv/download';
import StandardInputForm from '@/components/inputs/StandardInputForm.vue';
import WizardInputForm from '@/components/inputs/WizardInputForm.vue';

const route = useRoute();

// input validation
const inputEntrySchema = v.object({
  id: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  scope: v.pipe(v.number(), v.minValue(1), v.maxValue(3)),
  comment: v.pipe(v.string(), v.maxLength(255)),
  rawValue: v.pipe(v.number(), v.minValue(0)),
  parent: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  monthlyValues: v.boolean(),
  rawValueJan: v.pipe(v.number(), v.minValue(0)),
  rawValueFeb: v.pipe(v.number(), v.minValue(0)),
  rawValueMar: v.pipe(v.number(), v.minValue(0)),
  rawValueApr: v.pipe(v.number(), v.minValue(0)),
  rawValueMay: v.pipe(v.number(), v.minValue(0)),
  rawValueJun: v.pipe(v.number(), v.minValue(0)),
  rawValueJul: v.pipe(v.number(), v.minValue(0)),
  rawValueAug: v.pipe(v.number(), v.minValue(0)),
  rawValueSep: v.pipe(v.number(), v.minValue(0)),
  rawValueOct: v.pipe(v.number(), v.minValue(0)),
  rawValueNov: v.pipe(v.number(), v.minValue(0)),
  rawValueDec: v.pipe(v.number(), v.minValue(0)),
  equivalent: v.nullable(v.pipe(v.string(), v.maxLength(255))),
  report: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  category: v.nullable(v.pipe(v.string(), v.maxLength(255))),
});

// inner state
const filter = ref('');
const filterScopes = ref({
  '1': true,
  '2': true,
  '3': true,
});
const windowWidth = ref(window.innerWidth);

// comfort input stepper
const showComfortInput = ref(false);
const triggerAddANewFacility = ref(false);

// get "scope" from route
const preSelectedScope: Ref<'all' | '1' | '2' | '3'> = ref('all');
const preSelectedFacility = ref(null as null | string);

/**
 * Set the filters depending on the route
 */
const triggerRefresh = ref(false);
const setRouteFilter = () => {
  // filter by scope if set
  const scopeParam = route.params.scope; // "1", "2", "3", "all"
  const facilityParam = route.params.facility; // "some-id-string"
  // is param is not an Array and is one of the valid strings then return only the number
  // else return 1
  preSelectedScope.value =
    !Array.isArray(scopeParam) &&
    ['1', '2', '3', 'all'].indexOf(scopeParam) > -1
      ? (scopeParam as '1' | '2' | '3' | 'all')
      : 'all';
  if (preSelectedScope.value === 'all') {
    filterScopes.value['1'] = true;
    filterScopes.value['2'] = true;
    filterScopes.value['3'] = true;
  } else {
    filterScopes.value['1'] = preSelectedScope.value === '1';
    filterScopes.value['2'] = preSelectedScope.value === '2';
    filterScopes.value['3'] = preSelectedScope.value === '3';
  }

  preSelectedFacility.value =
    !Array.isArray(facilityParam) && facilityParam != null
      ? facilityParam
      : null;

  triggerRefresh.value = true;
};

// main data
const data = computed(() => {
  if (preSelectedScope.value === 'all') {
    return inputStore.allScopes;
  } else {
    return inputStore.allScopes.filter(
      (item) => item.scope === parseInt(preSelectedScope.value),
    );
  }
});

// wait for changes in the route
watch(route, () => {
  setRouteFilter();
});

// choose equivalent
const showChooseEquivalent = ref(false);

// choose facility
const showChooseFacility = ref(false);

// watch globalStore.selectedReport to reload the reports inputs
watch(
  () => globalStore.selectedReport,
  async () => {
    await inputStore.readUserInputsForUi();
  },
);

// new and empty input element
const showDialog = ref(false);

/**
 * Clone the input and set the scope and facility by the route
 */
const clone = (input: InputEntry) => {
  const c = JSON.parse(JSON.stringify(input));
  if (preSelectedScope.value === '1') c.scope = 1;
  else if (preSelectedScope.value === '2') c.scope = 2;
  else if (preSelectedScope.value === '3') c.scope = 3;
  if (preSelectedFacility.value != null) c.facility = preSelectedFacility.value;
  return c;
};
const selectedValue: Ref<InputEntry> = ref(
  getEmptyInput(globalStore.selectedReport?.id ?? ''),
);
const originalValue: Ref<InputEntry> = ref(
  getEmptyInput(globalStore.selectedReport?.id ?? ''),
);

/**
 * Watch the selectedValue and update the monthly values if the rawValue changes
 */
watch(
  () => selectedValue.value.rawValue,
  () => {
    if (!selectedValue.value.monthlyValues) {
      const keys: (keyof InputEntry)[] = [
        'rawValueJan',
        'rawValueFeb',
        'rawValueMar',
        'rawValueApr',
        'rawValueMay',
        'rawValueJun',
        'rawValueJul',
        'rawValueAug',
        'rawValueSep',
        'rawValueOct',
        'rawValueNov',
        'rawValueDec',
      ];
      keys.forEach((key) => {
        // @ts-ignore
        selectedValue.value[key] = round(selectedValue.value.rawValue / 12, 3);
      });
    }
  },
);

/**
 * watch selectedValue.equivalent in comfort mode to change the name and comment
 */
const updateNameAndCategory = () => {
  if (
    selectedValue.value.equivalent != null &&
    selectedValue.value.equivalent !== ''
  ) {
    const equivalent =
      globalStore.equivalentDict[selectedValue.value.equivalent];
    if (equivalent == null) {
      error(
        'Äquivalent wurde im Cache nicht gefunden. Bitte laden Sie die Seite neu.',
      );
      return;
    }
    selectedValue.value.name = equivalent.specification1;
    selectedValue.value.category = equivalent.category;
  }
};

/**
 * watch data to caclulate the sum of all sumValues
 */
const sumValue = computed(() => {
  return data.value.reduce((acc, item) => {
    return acc + item.sumValue;
  }, 0);
});

/**
 * Save the input to the database
 */
const save = async () => {
  try {
    // drop unrelevant fields
    // @ts-ignore
    // HACK. kann weg
    delete selectedValue.value.report_expanded;

    // validate
    v.parse(inputEntrySchema, selectedValue.value);

    if (selectedValue.value.id === 'new') {
      const toCreate = clone(selectedValue.value);
      delete toCreate.id;
      await inputStore.addInput(toCreate);

      showDialog.value = false;
      showComfortInput.value = false;
      // reset the form
      selectedValue.value = clone(
        getEmptyInput(globalStore.selectedReport?.id ?? ''),
      );
    } else {
      const updated = await inputStore.updateInput(selectedValue.value);
      const index = data.value.findIndex((item) => item.id === updated.id);
      data.value[index] = updated;

      showDialog.value = false;
      showComfortInput.value = false;
    }
  } catch (e) {
    error((e + '').replace('ValiError: ', ''));
  }
};

/**
 * Delete an entry
 */
const confirm = useConfirm();
const deleteEntry = async (entry: InputEntry, event: any) => {
  confirm.require({
    group: 'popup',
    target: event.currentTarget,
    message: 'Soll das Element wirklich gelöscht werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await inputStore.dropInput(entry);
      } catch (e) {
        error(e + '');
      }
    },
  });
};

/**
 * Calculate the relative percentage part for the whole sum by category
 * Will get the sumValue as whole sum and calculate the percentage part for each category
 */
const sumsByCategory = computed(() => {
  const relativeSums: MeterItem[] = [];
  // { label: 'Apps', color: '#34d399', value: 16 }

  data.value.forEach((item) => {
    const index = relativeSums.findIndex((i) => i.label === item.category);
    if (index === -1) {
      relativeSums.push({
        label: item.category ?? '',
        color: '#34d399',
        value: item.sumValue,
        icon: '',
      });
    } else {
      relativeSums[index].value += item.sumValue;
    }
  });
  // then calculate the percentage
  relativeSums.forEach((item) => {
    item.value = (item.value / sumValue.value) * 100;
  });
  // add colors
  const colors = getMonochromeColorPalette(relativeSums.length);
  relativeSums.forEach((item, index) => {
    item.color = colors[index];
  });
  return relativeSums;
});

/**
 * Download the data as CSV
 */
const download = async () => {
  await getInputsAsCsv(data.value);
};

/**
 * Lifecycle hook
 */
onMounted(async () => {
  setRouteFilter();
  await globalStore.refreshEquivalents();
  await inputStore.readUserInputsForUi();
});
</script>

<style>
.cst-no-hover > * > * > .p-datatable-tbody > tr:focus {
  outline: none !important;
}
</style>
