<template>
  <Toast />
  <ConfirmDialog group="dialog" />
  <ConfirmPopup group="popup" />
  <router-view v-if="route.name === 'login'" />
  <router-view
    v-else-if="global != null && !global.isLoading"
    :key="route.path"
  />
  <div
    v-else
    class="m-auto w-1/12 min-h-screen flex items-center justify-center"
  >
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from './stores/global';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const global = useGlobalStore();
const route = useRoute();
const router = useRouter();

const init = async () => {
  const i = await global.initializeStore();
  if (i.redirect) {
    console.log('Redirecting to', i.redirect);
    await router.push({ name: i.redirect });
  }
};

onMounted(() => {
  init();
});
</script>
