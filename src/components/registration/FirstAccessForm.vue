<template>
  <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
    <ContactForm v-for="(field, i) in fields.contacts" :key="field.type" v-model:data="fields.contacts[i]" class="mb-5" />
    <MogForm v-model:data="fields.mog" class="mb-5" />
    <BankAccountForm v-model:data="fields.bank" class="mb-5" />
	<UniqueCertificateHolderForm v-model:data="fields.uniqueCertificateHolder" :readonly=false class="mb-5" />

    <v-card>
      <v-card-text>
        <v-alert v-if="!form.status && form.hasErrors" type="error" class="mb-5">{{ $t('validation.errors.validationFail') }}</v-alert>

        <v-btn type="submit" class="d-block mx-auto" size="large" color="koperniko-primary" block
          :loading="isLoading">
          {{ $t('confirm') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref, type GlobalComponents, type Ref } from 'vue'
import ContactTypeEnum from '@/enums/ContactTypeEnum'
import { map } from 'lodash'
import ContactForm from './ContactForm.vue'
import MogForm from './MogForm.vue'
import BankAccountForm from './BankAccountForm.vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { useUsersStore } from '@/stores/users'
import { appReloadCurrentUserInjectionKey } from '@/utils/koperniko'
import UniqueCertificateHolderForm from '../registration/UniqueCertificateHolderForm.vue'

const $axios = inject(axiosInjectKey)
const $reloadCurrentUser = inject(appReloadCurrentUserInjectionKey)
const usersStore = useUsersStore()

const form = reactive({ status: true, hasErrors: false })

const contactTypes = computed(() =>
  Object.keys(ContactTypeEnum).filter(x => !(parseInt(x) >= 0))
)

const fields = reactive({
  contacts: map(contactTypes.value, type => ({
    type: ContactTypeEnum[type as keyof typeof ContactTypeEnum],
    email: '',
    name: '',
    surname: '',
    phone: '',
    mobile: ''
  })),
  mog: {
    mog: null
  },
  bank: { 
    accountholder: '',
    iban: '',
    // bank: '',
    // agency_number: '',
    // address: '',
    // house_number: '',
    // postal_code: '',
    // city: '',
    // province: '',
    // current_account_no: '',
  },
  uniqueCertificateHolder: {
	unique_certificate_holder_name: '',
	unique_certificate_holder_surname: '',
	unique_certificate_holder_fiscal_code: '',
	unique_certificate_holder_birth_place: '',
	unique_certificate_holder_birth_date: ''
  }
})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions
const handleSubmit = async () => {

  $reloadCurrentUser && $reloadCurrentUser()

  if (!formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  await $axios?.post(`/registration-request/${usersStore.userDetails.structureId}/complete`, fields)
    .then(async () => {
      $reloadCurrentUser && await $reloadCurrentUser()
    })
    .catch(console.error)

  toggleLoading()
}
</script>
