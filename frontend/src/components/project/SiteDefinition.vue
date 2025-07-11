<template>
  <InlineMessage
    v-if="global.showTooltips"
    severity="info"
    class="w-full mt-2 mb-4"
  >
    {{ $t('settings.projectSettings.sitesInline') }}
  </InlineMessage>

  <Toolbar>
    <template #start>
      <span>{{ $t('settings.projectSettings.selectedSite') }}</span>
      <Dropdown
        v-model="global.selectedSite"
        :options="global.sites"
        optionLabel="name"
        :placeholder="$t('settings.projectSettings.selectedSitePlaceholder')"
        class="ml-3"
        style="width: 300px"
        :disabled="siteForm?.id === 'new'"
      />
      <Button
        icon="fa-solid fa-pen"
        @click="showEditEntry = true"
        class="ml-1"
        v-tooltip.bottom="{
          value: $t('facilities.edit'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
      <Button
        icon="fa-solid fa-plus"
        @click="addEntry()"
        class="ml-1"
        v-tooltip.bottom="{
          value: $t('facilities.add'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
      <Button
        v-if="global.selectedSite"
        icon="fa-solid fa-trash"
        @click="confirmDelete(global.selectedSite, $event)"
        v-tooltip.bottom="{
          value: $t('facilities.delete'),
          showDelay: 500,
          hideDelay: 300,
        }"
        class="ml-1"
        :disabled="siteForm?.id === 'new'"
      />
    </template>
  </Toolbar>

  <div v-if="siteForm" class="mt-2" v-show="showEditEntry">
    <div class="card">
      <!-- <h5>Basisdaten des Standorts</h5> -->
      <div class="mb-4 grid" v-show="false">
        <label for="id" class="col-span-12 mb-2 md:col-span-4 md:mb-0">{{
          $t('settings.projectSettings.siteID')
        }}</label>
        <div class="col-span-12 md:col-span-8">
          <InputText
            id="id"
            class="w-full"
            disabled="true"
            v-model="siteForm.id"
          />
        </div>
        <InlineMessage
          v-if="global.showTooltips"
          severity="info"
          class="w-full mt-2"
        >
          {{ $t('settings.projectSettings.siteIDInline') }}
        </InlineMessage>
      </div>
      <div class="mb-4 grid">
        <label for="name" class="col-span-12 mb-2 md:col-span-4 md:mb-0">{{
          $t('settings.projectSettings.siteName')
        }}</label>
        <div class="col-span-12 md:col-span-8">
          <InputText id="name" class="w-full" v-model="siteForm.name" />
        </div>
        <InlineMessage
          v-if="global.showTooltips"
          severity="info"
          class="w-full mt-2"
        >
          {{ $t('settings.projectSettings.siteNameInline') }}
        </InlineMessage>
      </div>
    </div>

    <div>
      <Button
        @click="saveEntry()"
        :label="
          siteForm.id === 'new'
            ? $t('settings.projectSettings.add')
            : $t('global.save')
        "
      />
      <Button class="ml-2" @click="cancel()" :label="$t('global.cancel')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '../../stores/global';
import { ref, Ref, watch } from 'vue';
import { SiteEntry } from '../../services/types';
import { useConfirm } from 'primevue/useconfirm';
import * as v from 'valibot';
import { error, info } from '../../services/ui/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const showEditEntry = ref(false);

const siteForm: Ref<null | SiteEntry> = ref(global.selectedSite);
const siteSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
});

watch(
  () => global.selectedSite,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    global.changeSite(newValue);
    siteForm.value = newValue;
  },
);

const addEntry = () => {
  showEditEntry.value = true;
  if (!global.selectedProject) {
    return error('Es muss ein Projekt ausgewählt sein');
  }
  siteForm.value = {
    id: 'new',
    name: '',
    project: global.selectedProject.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const confirmDelete = async (site: SiteEntry, event: any) => {
  confirm.require({
    group: 'popup',
    target: event.currentTarget,
    message:
      'Soll dieser Standort wirklich gelöscht werden? Damit werden alle Berichte, Ziele und Eingaben gelöscht!',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await global.dropSite(site);
        siteForm.value = global.selectedSite;
      } catch (e) {
        error(e + '');
      }
    },
  });
};

const saveEntry = async () => {
  if (!siteForm.value) {
    return;
  }
  try {
    v.parse(siteSchema, siteForm.value);
    if (siteForm.value.id === 'new') {
      siteForm.value = await global.addSite(siteForm.value);
      global.selectedSite = siteForm.value;
      info('Standort wurde hinzugefügt');
    } else {
      siteForm.value = await global.updateSite(siteForm.value);
      info('Standort wurde gespeichert');
    }
  } catch (e) {
    error(e + '');
  }
  showEditEntry.value = false;
};

const cancel = () => {
  showEditEntry.value = false;
  siteForm.value = global.selectedSite;
};

const init = async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  siteForm.value = global.selectedSite;
};
init();
</script>
