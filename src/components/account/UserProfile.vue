<template>
  <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
    <v-row>
      <v-col v-for="field in fields" :key="field.label" cols="12" md="4">
        <v-text-field v-model="field.value" :label="$t(`account.profile.${field.label}`)" variant="outlined"
          hide-details="auto" :rules="field.rules" :disabled="field.disabled" />
      </v-col>
    </v-row>

    <v-btn type="submit" class="d-block mx-auto mt-5" size="large" color="koperniko-primary" :loading="isLoading">
      {{ $t('confirm') }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { useToggle } from '@vueuse/shared';
import { inject, reactive, ref, type Ref, type GlobalComponents, onMounted } from 'vue'
import { requiredValidation } from '@/validation/rules'
import { axiosInjectKey } from '@/utils/axios';
import { each, has, reduce } from 'lodash';

const $axios = inject(axiosInjectKey)

const form = reactive({ status: true })
const fields = reactive([
  { label: 'name', value: '', disabled: false, rules: [requiredValidation] },
  { label: 'surname', value: '', disabled: false, rules: [requiredValidation] },
  { label: 'username', value: '', disabled: true, rules: [] },
  { label: 'email', value: '', disabled: false, rules: [requiredValidation] },
])

// VueUse composables
const [isLoading, toggleLoading] = useToggle()

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Fucntions
const handleSubmit = async () => {
  if (!formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return }

  toggleLoading()

  const data = reduce(fields, (_data, field) => ({ ..._data, [field.label]: field.value }), {})

  await $axios?.patch(`/users/current`, data)
    .then(() => {
      // TODO aggiungere feedback
    })
    .catch(console.error)

  toggleLoading()
}

const loadData = async () => {
  toggleLoading()

  await $axios?.get(`/users/current`)
    .then(({ data }) => {
      const { data: userData } = data

      each(fields, (field, i) => {
        if (!has(userData, field.label)) { return }
        fields[i].value = userData[field.label]
      })
    })
    .catch(console.error)

  toggleLoading()
}

onMounted(() => {
  loadData()
})
</script>
