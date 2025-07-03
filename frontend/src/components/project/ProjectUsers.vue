<template>
  <Toolbar>
    <template #end>
      <Button
        icon="fa-solid fa-plus"
        @click="add()"
        class="ml-1"
        v-tooltip.bottom="{
          value: $t('facilities.add'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
    </template>
  </Toolbar>

  <DataTable :value="usersInProject" class="mt-5" :showGridlines="false">
    <Column field="email" header="User"></Column>
    <Column header="">
      <template #body="{ data }">
        <Button
          icon="fa-solid fa-trash"
          @click="confirmDrop(data, $event)"
          rounded
          v-tooltip.bottom="{
            value: $t('facilities.delete'),
            showDelay: 500,
            hideDelay: 300,
          }"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { useConfirm } from 'primevue/useconfirm';
import { error, info } from '../../services/ui/toast';

const global = useGlobalStore();
const confirm = useConfirm();

const usersInProject: Ref<any> = ref([]);

const add = () => {
  // ...
};

const confirmDrop = async (_data: any, event: any) => {
  confirm.require({
    group: 'popup',
    target: event.currentTarget,
    message: 'Soll dieser User wirklich entfernt werden?',
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        // ...
        info('User entfernt');
      } catch (e) {
        error(e + '');
      }
    },
  });
};

const init = async () => {
  while (global.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  // get all users in project
  // ...
};

onMounted(init);
</script>
