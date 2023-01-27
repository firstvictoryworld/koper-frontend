<template>    
  <CardContainer>
    <template #title>
      {{ $t('bookings.edit.show.title') }}
      <v-icon color="green" class="ml-2" size="22">mdi-check</v-icon>
    </template>

    <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
      <v-row>
        <template v-for="(field, key) of fields" :key="key">
          <v-col
            v-if="field.binds.type !== 'hidden' && (typeof field.show === 'function' ? field.show() : true)"
            cols="12"
            :md="field.binds.type === 'separator' ? 12 : 4"
          >
            <v-divider v-if="field.binds.type === 'separator'" />

            <v-select
              v-else-if="field.binds.type === 'select'"
              v-model="field.value"
              v-bind="field.binds"
              :label="$t(`bookings.edit.${key}`)"
            />

            <v-text-field
              v-else
              v-model="field.value"
              v-bind="field.binds"
              :label="$t(`bookings.edit.${key}`)"
            />
          </v-col>

        </template>
      </v-row>

      <template v-if="!readonly">
        <v-divider class="my-5" />

        <div class="d-flex justify-end">
          <v-btn type="submit" size="large" color="koperniko-primary" :loading="isLoading">
            {{ $t('confirm') }}
          </v-btn>
        </div>
      </template>
    </v-form>
  </CardContainer>

  <!-- Prestazioni -->

  <BookingsLendingsComponent v-if="bookingId" :booking-id="bookingId" :readonly="readonly" />

  <!-- Fatture -->

  <BookingsInvoicesComponent v-if="bookingId" :booking-id="bookingId" :readonly="readonly" />

  <!-- Totali Costi -->

  <BookingsTotalCostComponent v-if="validation.totalTable" :booking-id="bookingId" :readonly="readonly" />

  <!-- Other components -->

  <v-overlay v-bind:model-value="isLoading" :persistent="true" contained />

  <Teleport v-if="!readonly && component.mounted" to="#booking-toolbar-target">
    <v-btn class="mr-3" size="large" color="red-accent-2" variant="plain" :loading="isDeleting" @click="() => remove()">
      {{ $t('delete') }}
    </v-btn>
    <v-btn class="mr-3" size="large" color="blue-accent-2" :loading="isVerifying" @click="() => verify()">
      {{ $t('verify') }}
    </v-btn>
  </Teleport>

  <ErrorDialog :show="validation.showError" :title="$t('bookings.validation.errorTitle')" :message="validation.errorMessage" />

  <v-dialog
    :model-value="validation.validated"
    persistent
  >
    <v-card variant="elevated" min-width="280" max-width="800" class="mx-auto">
      <v-card-title class="text-h6 text-white bg-green-accent-4">
        {{ $t('bookings.validation.validatedTitle') }}
      </v-card-title>

      <v-card-text class="bg-white">
        {{ $t('bookings.validation.validatedMessage') }}
      </v-card-text>
     
      <v-card-actions class="bg-white d-flex justify-end">
        <v-btn class="mr-3" size="large" color="gray-accent-2" variant="plain" @click="() => validation.validated = false">
          {{ $t('cancel') }}
        </v-btn>

        <v-btn
          color="koperniko-primary"
          variant="flat"
          @click="() => emitBooking()"
        >
          {{ $t('emit') }}
        </v-btn>
      </v-card-actions>
      <BookingsTotalCostComponent v-if="validation.totalTable" :booking-id="bookingId" :readonly="readonly" />
      
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, watch, type GlobalComponents, type Ref } from 'vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import CardContainer from '../common/CardContainer.vue'
import { requiredValidation } from '@/validation/rules'
import BookingTypeEnum from '@/enums/BookingTypeEnum'
import { useI18n } from 'vue-i18n'
import { each, get, set } from 'lodash'
import BookingsLendingsComponent from './BookingsLendingsComponent.vue'
import BookingsInvoicesComponent from './BookingsInvoicesComponent.vue' 
import BookingsTotalCostComponent from './BookingsTotalCostComponent.vue' 
import type { VInput } from 'vuetify/lib/components/VInput/index'
import type { FieldInterface } from '@/@types/form'
import ErrorDialog from '../dialog/ErrorDialog.vue'
import { useUsersStore } from '@/stores/users'
import { parseISO, addDays, format as formatDate } from 'date-fns'

export interface BookingInterface {
  id: number
  patient_id: number
  structure_data_id: number
  type: number
  status: number
  recovery_reason: null | string
  recovery_from: null | string
  recovery_to: null | string
  booking_at: null | string
  booking_time: null | string
}

const $axios = inject(axiosInjectKey)
const i18n = useI18n()
const currentUser = useUsersStore()

const props = defineProps<{
  bookingId: number

}>()

// Computed
const isRecovery = computed(() => fields.type.value === BookingTypeEnum.RICOVERO)
const readonly = computed (() => !currentUser.isStruttura)

// Data

const bookingTypeOpt = reactive([
  { label: i18n.t('bookings.types.1'), value: BookingTypeEnum.AMBULATORIO },
  { label: i18n.t('bookings.types.2'), value: BookingTypeEnum.RICOVERO },
  { label: i18n.t('bookings.types.3'), value: BookingTypeEnum.ODONTOIATRICA },
  { label: i18n.t('bookings.types.4'), value: BookingTypeEnum.PREVENZIONE },
  { label: i18n.t('bookings.types.5'), value: BookingTypeEnum.GRAVI_MALATTIE },
])

const form = reactive({ 
  status: true,
  hasErrors: false
})

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto',
  readonly: readonly.value
} as Partial<VInput>

const fields: Record<string, FieldInterface> = reactive({
  type: { value: null, binds: { type: 'select', rules: [requiredValidation], items: bookingTypeOpt, itemTitle: 'label', itemValue: 'value', ...defaultInputBinds } },
  separator1: { value: null, binds: { type: 'separator' } },
  fiscal_code: { value: '', path: 'patient.fiscal_code', binds: { type: 'text', rules: [requiredValidation], readonly: true, ...defaultInputBinds } },
  name: { value: '', path: 'patient.name', binds: { type: 'text', rules: [requiredValidation], readonly: true, ...defaultInputBinds } },
  surname: { value: '', path: 'patient.surname', binds: { type: 'text', rules: [requiredValidation], readonly: true, ...defaultInputBinds } },
  separator2: { value: null, binds: { type: 'separator' }, show: () => isRecovery.value },
  recovery_reason: { value: '', binds: { type: 'text', rules: [requiredValidation], ...defaultInputBinds }, show: () => isRecovery.value },
  recovery_from: { value: '', binds: { type: 'date', rules: [requiredValidation], ...defaultInputBinds }, show: () => isRecovery.value },
  recovery_to: { value: '', binds: { type: 'date', rules: [requiredValidation], ...defaultInputBinds }, show: () => isRecovery.value },
})

const component = reactive({
  mounted: false
})

const validation = reactive({
  showError: false,
  errorMessage: '',
  validated: false,
  totalTable: false

})

const deliver = reactive({
  showError: false,
  errorMessage: '',
  delivered: false,

})

// Events
const emit = defineEmits(['updated', 'close'])

// VueUse composables
const [isDeleting, toggleDelete] = useToggle(false)
const [isVerifying, toggleVerify] = useToggle(false)
const [isLoading, toggleLoading] = useToggle(false)
const [isDelivering, toggleDelivering] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Watchers
const unwatchRecoveryFrom = watch(() => fields.recovery_from.value, (from) => {
  if (!from) { return }
  const date = parseISO(from)
  fields.recovery_to.value = formatDate(addDays(date, 8), 'yyyy-MM-dd')
}) 

// Functions

const handleSubmit = async () => {
  if (!formEl.value || !$axios) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  const data = {}
  each(fields, (field, key) => {
    if (/separator/.test(key)) { return }
    set(data, field.path || key, field.value)
  })

  await $axios.put(`/bookings/${props.bookingId}`, data)
    .then(() => {
      emit('updated')
    })
    .catch(console.error)

  toggleLoading()
}

const loadData = async () => {
  toggleLoading()

  await $axios?.get(`/bookings/${props.bookingId}`)
    .then(({ data }) => {
      each(fields, (field, key) => {
        const value = get(data, field.path || key)
        if (value === undefined) { return }
        fields[key].value = value
      })

      if (!fields.type.value) {
        fields.type.value = null
      }
    })
    .catch(console.error)

  toggleLoading()
}

const remove = async () => {
  toggleDelete()

  $axios?.delete(`bookings/${props.bookingId}/verification`)
    .then(() => {
      emit('close')
    })
    .catch(console.error)

  toggleDelete()
}

const verify = async () => {
  toggleVerify()

  $axios?.post(`bookings/${props.bookingId}/verification`)
    .then(({ data }) => {
      const { validated, message } = data
   
      validation.errorMessage = message || i18n.t('bookings.validation.error')
      validation.showError = !validated
      validation.validated = validated === true
      validation.totalTable = true
      
    })
    .catch(console.error)

  toggleVerify()
}

const emitBooking = async () => {
  toggleDelivering()

  // FIXME

  $axios?.get(`bookings/${props.bookingId}/deliver`)
    .then(({ data }) => {
      
      const { delivered, errors } = data

      deliver.errorMessage = errors
      deliver.showError = !delivered
      deliver.delivered = delivered === true
      
    })
    .catch(console.error)
    if(deliver){
      emit('close')
    }

  toggleDelivering()
}

onMounted(() => {
  loadData()
  component.mounted = true
})

onBeforeUnmount(() => {
  unwatchRecoveryFrom()
})
</script>