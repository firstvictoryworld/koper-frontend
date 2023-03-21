<template>
  <card-container
    :title="$t(`registration.contacts.title_${data.type}`)">
    <v-row>
      <template v-for="key in keys">
        <v-col v-if="!['type'].includes(key)" :key="key" cols="12" md="4">
          <v-text-field
            v-bind:model-value="data[key]"
            hide-details="auto"
            color="koperniko-secondary"
            variant="outlined"
            type="text"
            :label="$t(`registration.contacts.${key}`)"
            :rules="key === 'email' ? [requiredValidation, emailValidation] : [requiredValidation]"
            @update:modelValue="(value: string) => $emit('update:data', { ...data, [key]: value })"
            :disabled="!!readonly"
          />
        </v-col>
      </template>
    </v-row>
  </card-container>
</template>

<script setup lang="ts">
import CardContainer from '@/components/common/CardContainer.vue'
import { emailValidation, requiredValidation } from '@/validation/rules';
import { computed } from 'vue';

interface Record {
  name: string
  surname: string
  email: string
  phone: string
  mobile: string
  type: number
}

interface Props {
  data: Record,
  readonly: boolean
}

const props = defineProps<Props>()
const keys = computed(() => Object.keys(props.data) as (keyof Record)[])

</script>
