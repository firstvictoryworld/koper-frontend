<template>
  <v-container>
    <PageDescription
      :title="$t('agreements.title')"
      :subtitle="$t('agreements.subtitle')"
    />
    <AgreementsListComponent />
  </v-container>
</template>

<script setup lang="ts">
import AgreementsListComponent from '@/components/agreements/AgreementsListComponent.vue'
import PageDescription from '@/components/common/PageDescription.vue'
</script>
