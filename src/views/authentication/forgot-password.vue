<template>
  <v-form ref="formEl" class="mx-auto" v-model="form.status" @submit.prevent="handleSubmit">
    <v-icon size="x-large" color="koperniko-primary">
      mdi-account-box
    </v-icon>

    <h2 data-test="form-title" class="font-weight-bold mt-4 mb-7 text--darken-2">
      {{ $t('authentication.forgotPassword.title') }}
    </h2>
    <v-alert v-if="message.show" type="success">
      {{ $t('authentication.forgotPassword.message') }}
    </v-alert>

    <v-alert v-if="message.error" type="error">
      {{ $t('authentication.forgotPassword.error') }}
    </v-alert>

    <v-text-field
      v-model="fields.username"
      :label="$t('authentication.forgotPassword.emailAndUsername')"
      class="mt-4 mb-4"
      variant="outlined"
      hide-details="auto"
      :rules="[requiredValidation]"
    />

    <v-btn
      type="submit"
      color="koperniko-primary"
      block
      class="mr-4 text-none"
      :loading="isLoading"
    >
      {{ $t('authentication.forgotPassword.submit') }}
    </v-btn>
  </v-form>


</template>

<script setup lang="ts">
import { type Ref, ref, reactive, inject } from 'vue'
import { useToggle } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { requiredValidation } from '@/validation/rules'
import { axiosInjectKey } from '@/utils/axios'
import UserTypes from '@/enums/UserTypesEnum'

const $axios = inject(axiosInjectKey)
const router = useRouter()
const usersStore = useUsersStore()

const form = reactive({ status: false })
const fields = reactive({ username: ''})
const message = reactive({ show: false, message:'', error:'' })

// Elements
const formEl: Ref<null|{ validate(): Promise<{ valid: boolean }> }> = ref(null)

// VueUse composables
const [isLoading, toggleLoaderShown] = useToggle()
const [isPasswordShown, togglePasswordVisibility] = useToggle(false)

// Functions



const handleSubmit = async () => {
  if (!formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return }

  toggleLoaderShown()

  await $axios?.put('/notification/password', { ...fields })
    .then(({ data }) => {
      message.show = !data.error
      message.error = data.error
    })
    .catch(console.error)

  toggleLoaderShown()
}

</script>

<style lang="scss" scoped>
  form {
    max-width: 300px;
  }
</style>
