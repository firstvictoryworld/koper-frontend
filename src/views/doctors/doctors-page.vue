<template>
  <v-container>
    <PageDescription
      :title="$t('doctors.title')"
      :subtitle="$t('doctors.subtitle')"
    />
    <DoctorsListComponent />
  </v-container>
</template>

<script setup lang="ts">
import PageDescription from '@/components/common/PageDescription.vue'
import DoctorsListComponent from '@/components/doctors/DoctorsListComponent.vue'
</script>