<template>
  <CardContainer>
    <template #title>
      {{ $t('bookings.edit.show.title') }}
      <v-icon color="green" class="ml-2" size="22">mdi-check</v-icon>
    </template>
    <v-alert v-if="!readonlyConfirm.clicked" class="mb-5" type="warning"> {{ $t(`bookings.edit.messageBookingType`) }}</v-alert>

    <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
      <v-row>
        <template v-for="(field, key) of fields" :key="key">
          <v-col v-if="field.binds.type !== 'hidden' && (typeof field.show === 'function' ? field.show() : true)"
            cols="12" :md="field.binds.type === 'separator' ? 12 : 4">
            <v-divider v-if="field.binds.type === 'separator'" />

            <v-select v-else-if="field.binds.type === 'select'" v-model="field.value" v-bind="field.binds"
              :label="$t(`bookings.edit.${key}`)" :readonly="field.readonly" />

            <v-text-field v-else v-model="field.value" v-bind="field.binds" :label="$t(`bookings.edit.${key}`)"
              :readonly = "field.readonly" />
          </v-col>

        </template>
      </v-row>

      <template v-if="!props.readonly">
        <v-divider class="my-5" />
       
        <div class="d-flex justify-end">
          <v-btn type="submit" size="large" color="koperniko-primary" :loading="isLoading"
          :disabled="readonlyConfirm.value "
            @click="readonlyConfirm.clicked=true; readonlyBooking.value=false">
            {{ $t('confirm') }}
          </v-btn>
        </div>
      </template>
    </v-form>
  </CardContainer>
  <!-- Prestazioni -->
  <BookingsLendingsComponent v-if="bookingId" ref="bookingLendingComponent" :booking-id="bookingId"
    :booking-type="fields.type.value" :structure-id="props.structureId"
    :readonly="props.readonly || readonlyBooking.value" @status="(completed) => component.lendingsCompleted = completed"
    @updated="() => reloadOtherTables('lending')" />

  <BookingsObligationComponent v-if="bookingId" ref="bookingsObligationComponent" :booking-id="bookingId"
    :readonly="props.readonly" @status="(completed) => component.obligationsCompleted = completed"
    @updated="() => reloadOtherTables('obligations')" />

  <!-- Fatture -->

  <BookingsInvoicesComponent v-if="bookingId" ref="bookingsInvoicesComponent" :booking-id="bookingId"
    :readonly="props.readonly || readonlyBooking.value" @status="(completed) => component.invoicesCompleted = completed"
    @updated="() => reloadOtherTables('invoices')" />

  <!-- Totali Costi -->

  <BookingsTotalCostComponent v-if="bookingId" ref="bookingsTotalCostComponent" :booking-id="bookingId"
    :readonly="props.readonly" />

  <!-- Other components -->

  <v-overlay v-bind:model-value="isLoading" :persistent="true" contained />

  <Teleport v-if="!props.readonly && component.mounted" to="#booking-toolbar-target">
    <v-btn class="mr-3" size="large" color="red-accent-2" variant="plain" :loading="isDeleting" @click="() => remove()">
      {{ $t('delete') }}
    </v-btn>
    <v-btn class="mr-3" size="large" :color="verifiable ? 'blue-accent-2' : 'grey'" :loading="isVerifying"
      :disabled="!verifiable" @click="() => verify()">
      {{ $t('verify') }}
    </v-btn>
  </Teleport>

  <v-dialog :model-value="validation.showError" persistent>
    <v-card variant="elevated" min-width="280" max-width="480" class="mx-auto">
      <v-card-title class="text-h6 text-white bg-red-accent-2">
        {{ $t('bookings.validation.errorTitle') }}
      </v-card-title>

      <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
      <v-card-text class="bg-white" v-html="validation.errorMessage" />

      <v-card-actions class="bg-white">
        <v-btn color="koperniko-primary" variant="flat" @click="validation.showError = false">
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog :model-value="deliver.showError" persistent>
    <v-card variant="elevated" min-width="280" max-width="480" class="mx-auto">
      <v-card-title class="text-h6 text-white bg-red-accent-2">
        {{ $t('bookings.deliver.errorTitle') }}
      </v-card-title>

      <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
      <v-card-text class="bg-white" v-html="deliver.errorMessage" />

      <v-card-actions class="bg-white">
        <v-btn color="koperniko-primary" variant="flat" @click="deliver.showError = false">
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog :model-value="validation.validated" persistent>
    <v-card variant="elevated" min-width="70%" max-width="90%" class="mx-auto">
      <v-card-title class="text-h6 text-white bg-green-accent-4">
        {{ $t('bookings.validation.validatedTitle') }}
      </v-card-title>

      <v-card-text class="bg-white">
        {{ $t('bookings.validation.validatedMessage') }}
      </v-card-text>

      <v-card-actions class="bg-white d-flex justify-end">
        <v-btn class="mr-3" size="large" color="gray-accent-2" variant="plain"
          @click="() => validation.validated = false">
          {{ $t('close') }}
        </v-btn>

        <v-btn color="koperniko-primary" variant="flat" :disabled="!emitable"
          :loading="isDelivering" @click="() => emitBooking()">
          {{ $t('emit') }}
        </v-btn>
      </v-card-actions>

      <v-layout column style="height: 90vh">
        <v-flex md6 style="overflow: auto">
          <BookingsTotalCostComponent v-if="validation.totalTable" :booking-id="bookingId" :readonly="readonly" />
        </v-flex>
      </v-layout>

    </v-card>
  </v-dialog>

  <ErrorDialog v-model:show="errorDetails.show" :title="errorDetails.title" :message="errorDetails.message"
    max-width="480" />
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, watch, type GlobalComponents, type Ref } from 'vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import CardContainer from '../common/CardContainer.vue'
import { requiredValidation } from '@/validation/rules'
import BookingTypeEnum from '@/enums/BookingTypeEnum'
import { useI18n } from 'vue-i18n'
import { each, forEach, get, mapValues, set } from 'lodash'
import BookingsLendingsComponent from './BookingsLendingsComponent.vue'
import BookingsInvoicesComponent from './BookingsInvoicesComponent.vue'
import BookingsTotalCostComponent from './BookingsTotalCostComponent.vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import type { FieldInterface } from '@/@types/form'
import ErrorDialog from '../dialog/ErrorDialog.vue'
import { useUsersStore } from '@/stores/users'
import { parseISO, addDays, format as formatDate } from 'date-fns'
import BookingsObligationComponent from './BookingsObligationComponent.vue'
import StructureTypeEnum from '@/enums/StructureTypeEnum'

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
  readonly: boolean
  structureId: number
}>()

const readonlyBooking = reactive({ value: true })

const readonlyConfirm = reactive({ value: true, clicked: false })

// Computed
const isRecovery = computed(() => fields.type.value === BookingTypeEnum.RICOVERO)
// const readonly = computed (() => !currentUser.isStruttura)

// Data
const bookingTypeOpt = reactive([
  { label: i18n.t('bookings.types.1'), value: BookingTypeEnum.AMBULATORIO },
  { label: i18n.t('bookings.types.2'), value: BookingTypeEnum.RICOVERO },
  { label: i18n.t('bookings.types.3'), value: BookingTypeEnum.ODONTOIATRICA },
  { label: i18n.t('bookings.types.4'), value: BookingTypeEnum.PREVENZIONE },
  //{ label: i18n.t('bookings.types.5'), value: BookingTypeEnum.GRAVI_MALATTIE },// in attesa di conferme
])

const bookingTypeOptFilter = () => {
  if (currentUser.isBackoffice || currentUser.isFondo) {
    return bookingTypeOpt
  }

  return bookingTypeOpt.filter(opt => {
    if(currentUser.structureTypes.length === 1 && currentUser.structureTypes[0] === StructureTypeEnum.CENTRO_ODONTOIATRICO && opt.value === BookingTypeEnum.ODONTOIATRICA ) return opt
    if(currentUser.structureTypes.length === 1 && currentUser.structureTypes[0] != StructureTypeEnum.CENTRO_ODONTOIATRICO && opt.value != BookingTypeEnum.ODONTOIATRICA ) return opt
    if(currentUser.structureTypes.length > 1 && currentUser.structureTypes.includes(StructureTypeEnum.CENTRO_ODONTOIATRICO) ) return opt
    if(currentUser.structureTypes.length > 1 && !currentUser.structureTypes.includes(StructureTypeEnum.CENTRO_ODONTOIATRICO) && opt.value != BookingTypeEnum.ODONTOIATRICA) return opt
  });
   
}



const form = reactive({
  status: true,
  hasErrors: false
})

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto',
  readonly: props.readonly,
} as Partial<VInput>

const fields: Record<string, FieldInterface> = reactive({
  type: { value: null, binds: { type: 'select', rules: [requiredValidation], items: bookingTypeOptFilter(), itemTitle: 'label', itemValue: 'value', readonly:false, ...defaultInputBinds } },
  separator1: { value: null, binds: { type: 'separator' } },
  fiscal_code: { value: '', path: 'patient.fiscal_code', binds: { type: 'text', rules: [requiredValidation], readonly: true, ...defaultInputBinds } },
  name: { value: '', path: 'patient.name', binds: { type: 'text', rules: [requiredValidation], readonly: true, ...defaultInputBinds } },
  surname: { value: '', path: 'patient.surname', binds: { type: 'text', rules: [requiredValidation], readonly: true, ...defaultInputBinds } },
  separator2: { value: null, binds: { type: 'separator' }, show: () => isRecovery.value },
  recovery_reason: { value: '', binds: { type: 'text', rules: [requiredValidation], readonly: false, ...defaultInputBinds }, show: () => isRecovery.value },
  recovery_from: { value: '', binds: { type: 'date', rules: [requiredValidation], readonly: false, ...defaultInputBinds }, show: () => isRecovery.value },
  recovery_to: { value: '', binds: { type: 'date', rules: [requiredValidation], readonly: false, ...defaultInputBinds }, show: () => isRecovery.value },
})

const component = reactive({
  mounted: false,
  lendingsCompleted: false,
  obligationsCompleted: false,
  invoicesCompleted: false,
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

const errorDetails = reactive({ show: false, title: i18n.t('warning'), message: '' })

// Events
const emit = defineEmits(['updated', 'close'])

// VueUse composables
const [isDeleting, toggleDelete] = useToggle(false)
const [isVerifying, toggleVerify] = useToggle(false)
const [isLoading, toggleLoading] = useToggle(false)
const [isDelivering, toggleDelivering] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const bookingLendingComponent: Ref<null | InstanceType<typeof BookingsLendingsComponent>> = ref(null)
const bookingsObligationComponent: Ref<null | InstanceType<typeof BookingsObligationComponent>> = ref(null)
const bookingsInvoicesComponent: Ref<null | InstanceType<typeof BookingsInvoicesComponent>> = ref(null)
const bookingsTotalCostComponent: Ref<null | InstanceType<typeof BookingsTotalCostComponent>> = ref(null)

// Compured
const verifiable = computed(() => !!component.lendingsCompleted)
const emitable = computed(() => !!component.invoicesCompleted && !!component.lendingsCompleted && !!component.obligationsCompleted)

// Watchers
const unwatchRecoveryFrom = watch(() => fields.recovery_from.value, (from) => {
  if (!from) { return }
  const date = parseISO(from)
  fields.recovery_to.value = formatDate(addDays(date, 8), 'yyyy-MM-dd')
})

const unwatchFiscalCode = watch(() => fields.fiscal_code.value, (fiscal_code) => {
  if(fiscal_code) fields.fiscal_code.readonly =true
})

const unwatchName = watch(() => fields.name.value, (name) => {
  if(name) fields.name.readonly =true

})
const unwatchSurname = watch(() => fields.surname.value, (surname) => {
  if(surname) fields.surname.readonly =true
})

const unwatchType = watch(() => fields.type.value, (type) => {
  if (!type) { readonlyBooking.value = true; readonlyConfirm.clicked = false }
  else if (type && !readonlyConfirm.clicked) { fields.type.readonly = false; readonlyConfirm.value = false}
  else if (type && readonlyConfirm.clicked) { fields.type.readonly = true; readonlyConfirm.value = false; readonlyBooking.value=false}

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
      } else {
        readonlyBooking.value = false
        readonlyConfirm.clicked = true 
        readonlyConfirm.value = false 
        fields.type.readonly = true

      }
    })
    .catch(console.error)

  toggleLoading()
}

const remove = async () => {
  toggleDelete()

  await $axios?.delete(`bookings/${props.bookingId}`)
    .then(() => {
      emit('updated')
      emit('close')
    })
    .catch(console.error)

  toggleDelete()
}

const verify = async () => {

  if (!verifiable.value) { return }

  if (!component.obligationsCompleted) {
    errorDetails.message = i18n.t('bookings.errors.missingDocs')
    errorDetails.show = true

    return
  }

  toggleVerify()

  await $axios?.post(`bookings/${props.bookingId}/verification`)
    .then(({ data }) => {
      const { success, message } = data

      validation.errorMessage = message || i18n.t('bookings.validation.error')
      validation.showError = !success
      validation.validated = success === true
      validation.totalTable = true
      emit('updated')
    })
    .catch(console.error)

  toggleVerify()
}

const emitBooking = async () => {
  if (!emitable.value) { return }

  toggleDelivering()

  await $axios?.get(`bookings/${props.bookingId}/deliver`)
    .then(({ data }) => {

      const { success, message } = data
      const delivered = success
      deliver.errorMessage = message || i18n.t('bookings.deliver.error')
      deliver.showError = !delivered
      deliver.delivered = delivered === true

    })
    .catch(console.error)
  if (deliver.delivered) {
    emit('updated')
    emit('close')
  }
  toggleDelivering()
}

const reloadOtherTables = (from: string) => {
  switch (from) {
    case 'lending':
      bookingsObligationComponent.value?.reloadTable()
      bookingsInvoicesComponent.value?.reloadTable()
      break;
    case 'obligations':
      bookingLendingComponent.value?.reloadTable()
      bookingsInvoicesComponent.value?.reloadTable()
      break;
    case 'invoices':
      bookingLendingComponent.value?.reloadTable()
      bookingsObligationComponent.value?.reloadTable()
      break;
  }
  bookingsTotalCostComponent.value?.reloadTable()
}

onMounted(() => {
  loadData()
  component.mounted = true

})

onBeforeUnmount(() => {
  unwatchRecoveryFrom()
  unwatchFiscalCode()
  unwatchType()
  unwatchName()
  unwatchSurname()
})
</script>