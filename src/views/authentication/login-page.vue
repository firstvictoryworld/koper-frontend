<template>
  <v-form ref="formEl" class="mx-auto" v-model="form.status" @submit.prevent="handleSubmit">
    <v-icon size="x-large" color="koperniko-primary">
      mdi-account-box
    </v-icon>

    <h2 data-test="form-title" class="font-weight-bold mt-4 mb-7 text--darken-2">
      {{ $t('authentication.login.title') }}
    </h2>

    <v-text-field
      v-model="fields.email"
      :label="$t('authentication.login.fields.emailAndUsername')"
      class="mt-4 mb-4"
      variant="outlined"
      hide-details="auto"
      :rules="[requiredValidation]"
    />

    <v-text-field
      v-model="fields.password"
      :type="isPasswordShown ? 'text' : 'password'"
      :append-inner-icon="isPasswordShown ? 'mdi-eye' : 'mdi-eye-off'"
      :label="$t('authentication.login.fields.password')"
      variant="outlined"
      class="mt-4 mb-4"
      hide-details="auto"
      :rules="[requiredValidation]"
      @click:append-inner="togglePasswordVisibility"
    />

    <v-btn
      type="submit"
      color="koperniko-primary"
      block
      class="mr-4 text-none"
      :loading="isLoading"
    >
      {{ $t('authentication.login.submit') }}
    </v-btn>
    <a href="forgot-password">{{ $t('authentication.login.forgotPassword') }} </a>
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
const fields = reactive({ email: '', password: '' })

// Elements
const formEl: Ref<null|{ validate(): Promise<{ valid: boolean }> }> = ref(null)

// VueUse composables
const [isLoading, toggleLoaderShown] = useToggle()
const [isPasswordShown, togglePasswordVisibility] = useToggle(false)

// Functions
const redirectUserHome = () => {
  router.push('/')
}

const redirectUserAccount = () => {
  router.push('/account')
}

const handleRedirection = () => {
  const { type } = usersStore.userDetails

  if (type === UserTypes.STRUTTURA || type === UserTypes.UTENTE) {
    return usersStore.structureNotApproved || usersStore.structureRejected ? redirectUserAccount() : redirectUserHome()
  }

  if (type === UserTypes.BACKOFFICE || type === UserTypes.FONDO) {
    return redirectUserHome()
  }

  throw new Error('No valid redirect found')
}

const handleSubmit = async () => {
  if (!formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return }

  toggleLoaderShown()

  await $axios?.post('/login', { ...fields })
    .then(({ data }) => {
      usersStore.assignUserDetails(data)
      handleRedirection()
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
