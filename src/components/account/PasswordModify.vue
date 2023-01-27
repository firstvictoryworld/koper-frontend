<template>
  <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
    <v-row>
      <v-col v-for="field in fieldsKeys" :key="field" cols="12" md="4">
        <v-text-field v-model="fields[field]" :type="isPasswordShown ? 'text' : 'password'"
          :append-inner-icon="isPasswordShown ? 'mdi-eye' : 'mdi-eye-off'" :label="$t(field)" variant="outlined"
          hide-details="auto"
          :rules="field === 'current_password' ? [requiredValidation] : [requiredValidation, passwordValidation]"
          @click:append-inner="() => togglePasswordVisibility()" />
      </v-col>
    </v-row>

    <v-btn type="submit" class="d-block mx-auto mt-5" size="large" color="koperniko-primary" :loading="isLoading">
      {{ $t('confirm') }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { useToggle } from '@vueuse/shared';
import { inject, reactive, ref, type Ref, type GlobalComponents } from 'vue'
import { requiredValidation, passwordValidation } from '@/validation/rules'
import { axiosInjectKey } from '@/utils/axios';

const $axios = inject(axiosInjectKey)

const form = reactive({ status: true })
const fields = reactive({ current_password: '', password: '', password_confirmation: '' })
const fieldsKeys = reactive(Object.keys(fields) as Array<keyof typeof fields>)

// VueUse composables
const [isLoading, toggleLoading] = useToggle()
const [isPasswordShown, togglePasswordVisibility] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Fucntions
const handleSubmit = async () => {
  if (!formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return }

  toggleLoading()

  await $axios?.put('/users/password', { ...fields })
    .then(() => {
      formEl.value?.reset()
    })
    .catch(console.error)

  toggleLoading()
}
</script>
