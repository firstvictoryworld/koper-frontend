<template>
  <card-container
    :title="$t('registration.bankAccount.title')">
    <v-row>
      <v-col v-for="key in keys" :key="key" cols="12" md="4">
        <v-text-field
          v-bind:model-value="data[key]"
          hide-details="auto"
          color="koperniko-secondary"
          variant="outlined"
          type="text"
          :label="$t(`registration.bankAccount.${key}`)"
          :rules="[requiredValidation]"
          @update:modelValue="(value: string) => $emit('update:data', { ...data, [key]: value })"
        />
      </v-col>
    </v-row>
  </card-container>
</template>

<script setup lang="ts">
import CardContainer from '@/components/common/CardContainer.vue'
import { requiredValidation } from '@/validation/rules';
import { computed } from 'vue';

interface Record {
  accountholder: string
  iban: string
  bank: string
  agency_number: string
  address: string
  house_number: string
  postal_code: string
  city: string
  province: string
  current_account_no: string
}

interface Props {
  data: Record
}

const props = defineProps<Props>()
const keys = computed(() => Object.keys(props.data) as (keyof Record)[])
</script>
