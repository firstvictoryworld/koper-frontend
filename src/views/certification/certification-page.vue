<template>
  <v-container>
    <PageDescription
      :title="$t('certification.title')"
      :subtitle="$t('certification.subtitle')"
    />

    <CardContainer
    class="mt-5"
    :title="$t('agreements.contract.title')"
  >
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nec rutrum ligula, quis luctus mauris. Maecenas varius pharetra condimentum. Suspendisse dolor magna, cursus a ipsum eget, feugiat sodales nunc. Suspendisse iaculis non elit sed iaculis. Suspendisse dui enim, ullamcorper quis lacinia non, tempus eget urna. Aliquam tristique urna eu dui accumsan, id malesuada nisl mattis. Donec ante augue, facilisis ac eleifend at, imperdiet bibendum nulla.
    
    <v-divider />

    <v-checkbox
      :label="$t('agreements.contract.checkbox')"
      hide-details="auto"
      color="koperniko-secondary"
      variant="outlined"
      :true-value="1"
      :false-value="0"
      density="compact"
      v-model="contract.accepted"
      disabled
    />

   
  </CardContainer>
 
  </v-container>
</template>

<script setup lang="ts">
import PageDescription from '@/components/common/PageDescription.vue'
import { computed, inject, onMounted, reactive } from 'vue'

const contract = reactive({
  accepted: 1,
})
</script>