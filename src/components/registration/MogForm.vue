<template>
  <card-container
    :title="$t('registration.mog.title')">
    <v-radio-group
      :model-value="data.mog"
      :label="$t('registration.mog.label')"
      inline
      hide-details="auto"
      :rules="[requiredValidation]"
      @update:modelValue="(value: number) => $emit('update:data', { ...data, mog: value })"
    >
      <v-radio
        color="koperniko-secondary"
        :value="1"
        :label="$t('yes')"
      />

      <v-radio
        color="koperniko-secondary"
        :value="0"
        :label="$t('no')"
      />
    </v-radio-group>
  </card-container>
</template>

<script setup lang="ts">
import CardContainer from '@/components/common/CardContainer.vue'
import { requiredValidation } from '@/validation/rules';

interface Record {
  mog: null|number
}

interface Props {
  data: Record
}

defineProps<Props>()
</script>
