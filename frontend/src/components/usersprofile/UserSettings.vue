<template>
  <div v-if="user != null && user.meta != null">
    <div class="p-fluid mt-5">
      <h2>{{ $t('settings.userSettings.heading') }}</h2>
      <div class="p-fluid">
        <div class="grid grid-cols-12 flex items-center">
          <label class="col-span-12 md:col-span-4" for="displayInTons"
            >{{ $t('settings.userSettings.displayInTons') }}?</label
          >
          <InputSwitch
            id="displayInTons"
            class="ml-2"
            v-model="user.meta.displayInTons"
          />
        </div>
      </div>
    </div>

    <div class="p-fluid mt-5">
      <h2>{{ $t('settings.userSettings.subHeading') }}</h2>
      <div class="mt-4 flex flex-col gap-3">
        <div class="grid grid-cols-12">
          <label class="col-span-12 md:col-span-4" for="email">{{
            $t('settings.userSettings.email')
          }}</label>
          <InputText
            class="col-span-12 md:col-span-8"
            id="email"
            v-model="user.email"
          />
        </div>
        <div class="grid grid-cols-12">
          <label class="col-span-12 md:col-span-4" for="firstname">{{
            $t('settings.userSettings.firstName')
          }}</label>
          <InputText
            class="col-span-12 md:col-span-8"
            id="firstname"
            v-model="user.firstname"
          />
        </div>
        <div class="grid grid-cols-12">
          <label class="col-span-12 md:col-span-4" for="surname">{{
            $t('settings.userSettings.lastName')
          }}</label>
          <InputText
            class="col-span-12 md:col-span-8"
            id="surname"
            v-model="user.surname"
          />
        </div>
        <div class="grid grid-cols-12">
          <label class="col-span-12 md:col-span-4" for="department">{{
            $t('settings.userSettings.department')
          }}</label>
          <InputText
            class="col-span-12 md:col-span-8"
            id="department"
            v-model="user.meta.department"
          />
        </div>
        <div class="grid grid-cols-12">
          <label class="col-span-12 md:col-span-4" for="role">{{
            $t('settings.userSettings.role')
          }}</label>
          <InputText
            class="col-span-12 md:col-span-8"
            id="role"
            v-model="user.meta.role"
          />
        </div>
        <div class="grid grid-cols-12">
          <label class="col-span-12 md:col-span-4" for="telephone">{{
            $t('settings.userSettings.phone')
          }}</label>
          <InputText
            class="col-span-12 md:col-span-8"
            id="telephone"
            v-model="user.phoneNumber"
          />
        </div>

        <Button
          @click="saveUser"
          :disabled="false"
          class="mt-5"
          :label="$t('global.save')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, onMounted } from 'vue';
import { error } from './../../services/ui/toast';
import { useGlobalStore } from './../../stores/global';
import { UserEntry } from './../../services/types';
import dataprovider from './../../services/dataprovider';

const global = useGlobalStore();

const user: Ref<UserEntry | null> = ref(null);
const getData = async () => {
  try {
    user.value = (await dataprovider.getUser()) as UserEntry;

    if (user.value.meta == null) {
      user.value.meta = {
        displayInTons: false,
        department: '',
        role: '',
      };
    } else if (user.value.meta.displayInTons == null) {
      user.value.meta.displayInTons = false;
    } else if (user.value.meta.department == null) {
      user.value.meta.department = '';
    } else if (user.value.meta.role == null) {
      user.value.meta.role = '';
    }
  } catch (e: any) {
    error(e + '');
  }
};

const saveUser = async () => {
  try {
    if (user.value == null || user.value.id == null) return;
    await dataprovider.updateUser(user.value);
    global.displayInTons = user.value.meta?.displayInTons ?? false;
  } catch (e: any) {
    error(e + '');
  }
};

onMounted(() => {
  getData();
});
</script>
