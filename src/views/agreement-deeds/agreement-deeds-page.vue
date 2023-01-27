<template>
  <v-container>
    <PageDescription
      :title="$t('agreementDeed.title')"
      :subtitle="$t('agreementDeed.subtitle')"
    />
  </v-container>
</template>

<script setup lang="ts">
import PageDescription from '@/components/common/PageDescription.vue'
</script>