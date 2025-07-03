<template>
  <Card v-if="scope === 'all'" class="h-full">
    <template #header>
      <div class="psm-report-header">
        <h3 v-html="$t('report.scopeDescription.co2accounting')"></h3>
      </div>
    </template>
    <template #content>
      <img src="./../../../assets/scopes.png" alt="Scope" style="width: 100%" />
      <p v-html="$t('report.scopeDescription.co2BalanceDescription')"></p>
    </template>
  </Card>

  <Card v-if="scope === '1'" class="h-full">
    <template #header>
      <div class="psm-report-header">
        <h3>{{ $t('report.scopeDescription.contents') }}</h3>
      </div>
    </template>
    <template #title>
      {{ $t('global.sidebar.scope', { scope: '1' }) }}
    </template>
    <template #content>
      <p>
        {{ $t('report.scopeDescription.directEmissions') }}
      </p>
    </template>
  </Card>

  <Card v-if="scope === '2'" class="h-full">
    <template #header>
      <div class="psm-report-header">
        <h3>{{ $t('report.scopeDescription.contents') }}</h3>
      </div>
    </template>
    <template #title>
      {{ $t('global.sidebar.scope', { scope: '2' }) }}
    </template>
    <template #content>
      <p>
        {{ $t('report.scopeDescription.indirectEmissions') }}
      </p>
    </template>
  </Card>

  <Card v-if="scope === '3'" class="h-full">
    <template #header>
      <div class="psm-report-header">
        <h3>{{ $t('report.scopeDescription.contents') }}</h3>
      </div>
    </template>
    <template #title>
      {{ $t('global.sidebar.scope', { scope: '3' }) }}</template
    >
    <template #content>
      <p>
        {{ $t('report.scopeDescription.otherIndirectEmissions') }}
      </p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

defineProps({
  scope: {
    type: String as PropType<string>,
    required: true,
  },
});
</script>
