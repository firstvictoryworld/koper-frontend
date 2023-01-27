<template>
  <v-container>
    <PageDescription
      :title="$t('specializations.title')"
      :subtitle="$t('specializations.subtitle')"
    />
    <SpecializationsListComponent />
  </v-container>
</template>

<script setup lang="ts">
import PageDescription from '@/components/common/PageDescription.vue'
import SpecializationsListComponent from '@/components/specializations/SpecializationsListComponent.vue'
</script>