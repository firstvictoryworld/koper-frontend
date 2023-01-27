<template>
  <v-form ref="formEl" lazy-validation v-model="form.status">
    <v-row class="justify-center">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="fields.main_fiscal_code"
          :label="$t(`bookings.edit.main_fiscal_code`)"
          variant="outlined"
          hide-details="auto"
          :rules="[requiredValidation]"
          @keyup.enter="handleSearch"
        >
          <template #append-inner>
            <v-btn
              type="submit"
              size="small"
              color="koperniko-primary"
              :loading="isSearching"
              @click="handleSearch"
            >
              {{ $t('bookings.edit.checkUser.submit') }}
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-alert v-if="typeof form.hasErrors === 'string'" type="error">{{ form.hasErrors }}</v-alert>

    <template v-if="users.list.length">
      <v-list class="mt-5 mx-auto" max-width="560">
        <v-list-item
          v-for="(user, i) of users.list"
          :key="user.fiscal_code"
          :title="`${user.name} ${user.surname}`"
          :style="{
            'border-top': i > 0 ? '1px solid #f3f3f3' : null
          }"
          lines="three"
        >
          <template #subtitle>
            <div v-html="userDesc(user)" />
          </template>

          <template v-slot:append>
            <v-btn
              color="koperniko-primary"
              v-t="'bookings.edit.checkUser.select'"
              @click="() => handleUserSelection(user)"
            />
          </template>
        </v-list-item>
      </v-list>
    </template>

    <v-overlay v-bind:model-value="isLoading" :persistent="true" contained />
  </v-form>
</template>

<script setup lang="ts">
import { inject, reactive, ref, type GlobalComponents, type Ref } from 'vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { requiredValidation } from '@/validation/rules';
import { useI18n } from 'vue-i18n';

interface User {
  fiscal_code: string
  name: string
  surname: string
}

const $axios = inject(axiosInjectKey)
const i18n = useI18n()

const form = reactive({ 
  status: true,
  hasErrors: false as boolean | string
})

const fields = reactive({
  main_fiscal_code: '',
})

const users = reactive({
  list: [] as User[]
})

// Events
const emit = defineEmits(['created'])

// VueUse composables
const [isSearching, toggleSearching] = useToggle(false)
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions

const handleSearch = async () => {
  if (!formEl.value || !$axios) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  toggleSearching()

  form.hasErrors = false

  await $axios.get('/bookings/check-user', {
    params: fields
  })
    .then(({ data }) => {
      users.list = data.users
      if (!data.users.length) {
        form.hasErrors = i18n.t('bookings.edit.checkUser.userNotFound')
      }
    })
    .catch(console.error)

  toggleSearching()
}

const handleUserSelection = async (user: Record<string, any>) => {
  if (!formEl.value || !$axios) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  toggleLoading()

  await $axios.post('/bookings', {
    ...user
  })
    .then(({ data }) => {
      const { booking } = data
      emit('created', booking)
    })
    .catch(console.error)

  toggleLoading()
}

const userDesc = (user: Record<string, any>): string => {
  const parts = [
    i18n.t('bookings.edit.checkUser.kinship') + ':',
    i18n.t(`bookings.edit.checkUser.types.${user.degree_of_kinship}`),
    '<br>',
    i18n.t('bookings.edit.checkUser.assistableFrom'),
    user.assistable_from,
  ]
  if (user.assistable_to) {
    parts.push(
      i18n.t('bookings.edit.checkUser.assistableTo'),
      user.assistable_to,
    )
  } 
  return parts.join(' ')
}

</script>