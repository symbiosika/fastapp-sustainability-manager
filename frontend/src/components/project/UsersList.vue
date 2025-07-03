<template>
  <h4 class="text-slate-800">
    {{ $t('settings.projectSettings.assignedUsers') }}
  </h4>
  <Toolbar>
    <template #start>
      <InputText
        v-model="emailToSearch"
        placeholder="Email"
        class="ml-3"
        style="width: 300px"
      />
      <Button
        v-if="foundUser"
        icon="fa-solid fa-check"
        severity="success"
        @click="addUserToProject"
        class="ml-1"
        v-tooltip.bottom="{
          value: $t('users.add'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
      <Button
        icon="fa-solid fa-search"
        @click="searchUser"
        class="ml-1"
        v-tooltip.bottom="{
          value: $t('users.add'),
          showDelay: 500,
          hideDelay: 300,
        }"
      />
    </template>
  </Toolbar>
  <div>
    <div
      v-for="user in listOfUsers"
      :key="user.id"
      class="relative p-3 mb-4 border rounded shadow-sm"
    >
      <Button
        size="small"
        :disabled="user.email === global.username"
        @click="dropUserFromProject($event, user)"
        class="absolute top-0 right-0 mt-2 mr-2 text-white"
        icon="fa-solid fa-times"
      >
      </Button>
      <div class="font-semibold">{{ user.email }}</div>
      <div class="text-gray-600">{{ user.surname }}</div>
      <div class="text-gray-600">{{ user.firstname }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '../../stores/global';
import { ref, watch, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { error, info } from '../../services/ui/toast';
import dataprovider from '../..//services/dataprovider';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const global = useGlobalStore();
const confirm = useConfirm();

watch(
  () => global.selectedProject,
  async (newValue) => {
    if (newValue) {
      init();
    }
  },
);

interface User {
  id: string;
  email: string;
  surname: string;
  firstname: string;
}

const listOfUsers = ref(<User[]>[]);
const emailToSearch = ref('');
const foundUser = ref<User | null>(null);

const searchUser = async () => {
  foundUser.value = null;
  try {
    const result = await dataprovider.searchForUser(emailToSearch.value);
    foundUser.value = result;
  } catch (e) {
    info(t('settings.projectSettings.userNotFound'));
    foundUser.value = null;
    emailToSearch.value = '';
  }
};

const addUserToProject = async () => {
  if (!foundUser.value) {
    return;
  }
  // check if user is still in list
  if (listOfUsers.value.find((u) => u.id === foundUser.value?.id)) {
    info(t('settings.projectSettings.userAlreadyExisting'));
    foundUser.value = null;
    emailToSearch.value = '';
    return;
  }
  try {
    await dataprovider.addUserToProject(
      global.selectedProject?.id!,
      foundUser.value?.id,
    );
    info(t('settings.projectSettings.addUserSuccess'));
    foundUser.value = null;
    emailToSearch.value = '';
    init();
  } catch (e) {
    error(e + '');
  }
};

const dropUserFromProject = async (event: any, user: User) => {
  confirm.require({
    group: 'popup',
    target: event.currentTarget,
    message: t('settings.projectSettings.confirmDropUser'),
    icon: 'fa-solid fa-question',
    accept: async () => {
      try {
        await dataprovider.dropUserFromProject(
          global.selectedProject?.id!,
          user.id,
        );
        info(t('settings.projectSettings.dropUserSuccess'));
        init();
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
  // get all assigned users
  listOfUsers.value = await dataprovider.getUsersToProject(
    global.selectedProject?.id!,
  );
};

onMounted(() => {
  init();
});
</script>
