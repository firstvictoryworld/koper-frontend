<template>
  <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
    <BankAccountForm v-model:data="fields.bank" :readonly=false class="mb-5" />
	<UniqueCertificateHolderForm v-model:data="fields.uniqueCertificateHolder" :readonly=false class="mb-5" />

    <v-card v-if="props.show">
      <v-card-text>
        <v-alert v-if="!form.status && form.hasErrors" type="error" class="mb-5">{{ $t('validation.errors.validationFail') }}</v-alert>
        <v-alert v-if="readonly && updated.show" type="success">{{ $t('registration.updated') }}</v-alert>

        <v-btn type="submit" class="d-block mx-auto mt-5" size="large" color="koperniko-primary"
          :loading="isLoading">
          {{ $t('confirm') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref, type GlobalComponents, type Ref, onMounted } from 'vue'
import ContactTypeEnum from '@/enums/ContactTypeEnum'
import { map } from 'lodash'
import BankAccountForm from '../registration/BankAccountForm.vue'
import UniqueCertificateHolderForm from '../registration/UniqueCertificateHolderForm.vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { useUsersStore } from '@/stores/users'
import { appReloadCurrentUserInjectionKey } from '@/utils/koperniko'

const $axios = inject(axiosInjectKey)
const $reloadCurrentUser = inject(appReloadCurrentUserInjectionKey)
const usersStore = useUsersStore()

const form = reactive({ status: true, hasErrors: false })

const contactTypes = computed(() =>
  Object.keys(ContactTypeEnum).filter(x => !(parseInt(x) >= 0))
)

const fields = reactive({
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

// Props
const props = defineProps<{
  readonly?: boolean
  structureId?: number
  show?: boolean
}>()

const updated = reactive({ show: false})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)


// Functions
const handleSubmit = async () => {
  updated.show = false
  $reloadCurrentUser && $reloadCurrentUser()

  if (!formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  await $axios?.put(`/registration-request/${props.structureId}/complete`, fields)
    .then(async () => {
      $reloadCurrentUser && await $reloadCurrentUser()
      if(props.structureId){ updated.show = true }
    })
    .catch(console.error)

  toggleLoading()
}


const loadData = async () => {
  if (!props.structureId) { return }

  toggleLoading()

  await $axios?.get(`/registration-request/${props.structureId}`)
    .then(({ data }) => {
      fields.bank.accountholder = data.refound_data[0].accountholder
      fields.bank.iban = data.refound_data[0].iban
    //   fields.bank.bank = data.refound_data[0].bank,
    //   fields.bank.agency_number = data.refound_data[0].agency_number,
    //   fields.bank.address = data.refound_data[0].address,
    //   fields.bank.house_number = data.refound_data[0].house_number,
    //   fields.bank.postal_code = data.refound_data[0].postal_code,
    //   fields.bank.city = data.refound_data[0].city,
    //   fields.bank.province = data.refound_data[0].province,
    //   fields.bank.current_account_no = data.refound_data[0].current_account_no

		fields.uniqueCertificateHolder.unique_certificate_holder_name = data.refound_data[0].unique_certificate_holder_name
		fields.uniqueCertificateHolder.unique_certificate_holder_surname = data.refound_data[0].unique_certificate_holder_surname
		fields.uniqueCertificateHolder.unique_certificate_holder_fiscal_code = data.refound_data[0].unique_certificate_holder_fiscal_code
		fields.uniqueCertificateHolder.unique_certificate_holder_birth_place = data.refound_data[0].unique_certificate_holder_birth_place
		fields.uniqueCertificateHolder.unique_certificate_holder_birth_date = data.refound_data[0].unique_certificate_holder_birth_date

    })
    .catch(console.error)

  toggleLoading()
}

onMounted(() => {
  loadData()
})

</script>
