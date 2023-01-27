<template>
  <v-container>
    <PageDescription
      :title="$t('bookings.title')"
      :subtitle="$t('bookings.subtitle')"
    />
    <BookingsListComponent />
  </v-container>
</template>

<script setup lang="ts">
import BookingsListComponent from '@/components/bookings/BookingsListComponent.vue'
import PageDescription from '@/components/common/PageDescription.vue'
</script>
