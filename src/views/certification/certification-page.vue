<template>
  <v-container>
    <PageDescription
      :title="$t('certifications.title')"
      :subtitle="$t('certifications.subtitle')"
    />
    <CertificationsListComponent />
  </v-container>
</template>

<script setup lang="ts">
import PageDescription from '@/components/common/PageDescription.vue'
import CertificationsListComponent from '@/components/certifications/CertificationsListComponent.vue'

</script>