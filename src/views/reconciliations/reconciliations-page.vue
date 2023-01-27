<template>
  <v-container>
    <PageDescription
      :title="$t('reconciliations.title')"
      :subtitle="$t('reconciliations.subtitle')"
    />
    <ReconciliationsListComponent />
  </v-container>
</template>

<script setup lang="ts">
import ReconciliationsListComponent from '@/components/reconciliations/ReconciliationsListComponent.vue'
import PageDescription from '@/components/common/PageDescription.vue'
</script>
