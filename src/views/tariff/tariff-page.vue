<template>
  <v-container>
    <PageDescription
      :title="$t('tariff.title')"
      :subtitle="$t('tariff.subtitle')"
    />
    <LendingCategoryComponent />
  </v-container>
</template>

<script setup lang="ts">
import PageDescription from '@/components/common/PageDescription.vue'
import LendingCategoryComponent from '@/components/tariff/LendingCategoryComponent.vue'
</script>