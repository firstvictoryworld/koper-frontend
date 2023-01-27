<template>
  <CardContainer
    class="mt-5"
    :title="$t('bookings.edit.summary_cost.title')"
    :no-padding="true"
  >  
 
    <DataTable ref="refTable" :cols="cols" :url="`/bookings/${props.bookingId}/lendings/total`" local-prefix="bookings.edit.summary_cost." :noSearchable=true totalFundCostTitle="Totale Fondo" totalStructureCostTitle="Totale da fatturare" totalPatientCostTitle="Totale Associato">
     
      <template #col-name="{ row }">
        {{ row.lending_agreement?.lending?.name }}
      </template>

      <template #col-fund_cost="{ row }">
        {{ row?.fund_cost }}
      </template>

      <template #col-structure_cost="{ row }">
        {{ row?.structure_cost }}
      </template>

    </DataTable>
  </CardContainer>

  <v-dialog
    v-bind:model-value="dialog.show"
    :scrim="true"
    persistent
    transition="dialog-bottom-transition"
    max-width="1100"
  >
    <v-card v-if="dialog.show" :loading="isLoading" color="grey-lighten-4">
      <v-toolbar
        dark
        color="koperniko-primary"
      >
        <v-toolbar-title>
          {{ $t('bookings.edit.lendings.edit') }}
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <v-btn icon dark @click="() => dialog.show = false" >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <CardContainer class="mb-5">
          <v-form ref="formDialogEl" lazy-validation v-model="formDialog.status" @submit.prevent="handleSubmit">
            <v-row>
             
              <v-col cols="12">
                <LendingAgreementAutocompleteComponent v-model:value="dialog.lendings.selected" :return-object="true" :binds="{ readonly: !!props.readonly }" />
              </v-col>

              <v-col cols="12">
                <SpecializationAutocompleteComponent v-model:value="dialog.specializations.selected" :return-object="true" :binds="{ readonly: !!props.readonly }" />
              </v-col>

              <v-col cols="12">
                <DoctorLendingAutocompleteComponent v-model:value="dialog.doctors.selected" :return-object="true" :binds="{ readonly: !!props.readonly }" :lending-id = "dialog.lendings?.selected?.lending?.id"/>
              </v-col>

              <template v-for="(field, key) of dialog.fields" :key="key">
                <v-col
                  v-if="field.binds.type !== 'hidden' && (typeof field.show === 'function' ? field.show() : true)"
                  cols="12"
                  :md="field.size || '4'"
                >
                  <v-select
                    v-if="field.binds.type === 'select'"
                    v-model.number="field.value"
                    :label="$t(`bookings.edit.lendings.${key}`)"
                    v-bind="field.binds"
                  />

                  <v-text-field
                    v-else-if="field.binds.type === 'number'"
                    v-model.number="field.value"
                    :label="$t(`bookings.edit.lendings.${key}`)"
                    v-bind="field.binds"
                    class="hide-arrows"
                  />

                  <v-text-field
                    v-else
                    v-model="field.value"
                    :label="$t(`bookings.edit.lendings.${key}`)"
                    v-bind="field.binds"
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
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog
    v-bind:model-value="dialogObligation.show"
    :scrim="true"
    persistent
    transition="dialog-bottom-transition"
    max-width="1100"
  >
    <v-card v-if="dialogObligation.show" :loading="isLoading" color="grey-lighten-4">
      <v-toolbar
        dark
        color="koperniko-primary"
      >
        <v-toolbar-title>
          {{ $t('bookings.edit.lendings.obligations_title') }}
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <v-btn icon dark @click="() => dialogObligation.show = false" >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <BookingsLendingObligationComponent v-if="dialogObligation.id" :booking-id="bookingId" :lending-id="dialogObligation.id" :readonly="readonly" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { currencyValidation, requiredValidation } from '@/validation/rules'
import { useToggle } from '@vueuse/shared'
import { each, has } from 'lodash'
import { inject, reactive, ref, onBeforeUnmount, watch, type GlobalComponents, type Ref } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import LendingAgreementAutocompleteComponent from '../autocomplete/LendingAgreementAutocompleteComponent.vue'
import DoctorLendingAutocompleteComponent from '../autocomplete/DoctorLendingAutocompleteComponent.vue'
import DataTable from '../common/DataTable.vue'
import type { LendingInterface } from '../tariff/LendingComponent.vue'
import CardContainer from '../common/CardContainer.vue'
import BookingsLendingObligationComponent from './BookingsLendingObligationComponent.vue'
import SpecializationAutocompleteComponent from '../autocomplete/SpecializationAutocompleteComponent.vue'
import LendingAgreementCategoryAutocompleteComponent from '../autocomplete/LendingAgreementCategoryAutocompleteComponent.vue'

interface DoctorInterface {
  id?: number
  name: string
  surname: string
}

interface AgreededLandingInterface {
  id: number
  refund_value: number
  agreeded_cost: number
  lending?: LendingInterface
}

interface SpecializationInterface {
  id?: number
  name: string
}

interface BookedLandingInterface {
  current_price: undefined | number
  iva: undefined | number
  quantity: number
}

interface BookedLandingRequestInterface extends BookedLandingInterface {
  id: null | number
  lending_agreement?: AgreededLandingInterface
  doctor?: DoctorInterface
  specialization?: SpecializationInterface
}

interface FileInterface {
  id: undefined | number
  filename: string
}

interface BookingFileObligationInterface {
  type_obligation: number
}

interface LendingDocumentInterface {
  id: number
  name: string
  required: 0 | 1
}

interface BookingObligationInterface extends FileInterface {
  booking_file_obligation: BookingFileObligationInterface
  lending_document?: LendingDocumentInterface
}

type BookedLandingFieldsKeys = keyof BookedLandingInterface

type BookedLandingFieldsInterface = {
  [key in BookedLandingFieldsKeys]: {
    value: any
    show?: () => boolean
    size?: number
    binds: Record<string, any>
  }
}

const props = defineProps<{
  bookingId: number
  readonly?: boolean
}>()

const $axios = inject(axiosInjectKey)

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto',
  readonly: props.readonly
} as Partial<VInput>

const formDialog = reactive({ 
  status: true,
  hasErrors: false
})

const cols = reactive([
  { key: 'id' },
  { key: 'name' },
  { key: 'quantity' },
  { key: 'current_price' },
  { key: 'fund_cost' },
  { key: 'structure_cost' },
  { key: 'patient_cost' },
  
] as DatatableColInterface[])

const dialog = reactive({ 
  show: false,
  id: null as null | number,
  fields: {
    current_price: { value: undefined, binds: { rules: [requiredValidation, currencyValidation], type: 'number', max: 1000000, ...defaultInputBinds } },
    iva: { value: undefined, binds: { rules: [requiredValidation], type: 'select', items: [0,4,5,10,22], ...defaultInputBinds } },
    quantity: { value: undefined, binds: { rules: [requiredValidation], type: 'number', ...defaultInputBinds } },
  } as BookedLandingFieldsInterface,
  lendings: {
    selected: undefined as undefined | AgreededLandingInterface,
  },
  specializations: {
    selected: undefined as undefined | SpecializationInterface,
  },
  doctors: {
    selected: undefined as undefined | DoctorInterface,
  }
})

const dialogObligation = reactive({ 
  show: false,
  id: null as null | number,

})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const refTable: Ref<null | GlobalComponents['VForm']> = ref(null)

// Watchers
const unwatchLending = watch(() => dialog.lendings.selected, (lending: undefined|AgreededLandingInterface) => {
  if (!lending) { return }
  dialog.fields.current_price.value = lending.agreeded_cost || 0
})

const unwatchCurrentPrice = watch(() => dialog.fields.current_price.value, (value: undefined|number) => {
  const maxValue = dialog.lendings.selected?.agreeded_cost || 0
  if (!value || value <= maxValue) { return }
  dialog.fields.current_price.value = maxValue
})


// Functions
const add = () => {
  show({
    id: null,
    current_price: undefined,
    iva: 0,
    quantity: 1,
    lending_agreement: undefined,
    doctor: undefined,
    specialization: undefined,
  })
}

const show = (bookingLending: BookedLandingRequestInterface) => {
  each(dialog.fields, (field, key) => {
    if (!has(bookingLending, key)) { return }
    field.value = bookingLending[key as keyof BookedLandingInterface]
  })

  dialog.lendings.selected = bookingLending.lending_agreement
  dialog.doctors.selected = bookingLending.doctor
  dialog.specializations.selected = bookingLending.specialization

  dialog.id = bookingLending.id

  dialog.show = true
}

const upload = (bookingLending: BookedLandingRequestInterface) => {

  dialogObligation.id = bookingLending.id
  dialogObligation.show = true
}


const handleSubmit = async () => {
  if (!formDialogEl.value || !$axios) { return }

  await formDialogEl.value.validate()

  if (!formDialog.status) { return formDialog.hasErrors = true }

  formDialog.hasErrors = false

  toggleLoading()

  const { id } = dialog
  const url = `/bookings/${props.bookingId}/lendings${ id ? `/${id}` : '' }`
  const method = /\/[0-9]+$/.test(url) ? 'put' : 'post'

  const data = {
    lending_agreement_id: dialog.lendings.selected?.id,
    doctor_id: dialog.doctors.selected?.id,
    specialization_id: dialog.specializations.selected?.id
  }
  each(dialog.fields, (field, key) => Object.assign(data, { [key]: field.value }))

  await $axios?.request({
    url,
    data,
    method
  })
    .then(() => {
      refTable.value?.loadData()
      dialog.show = false
    })
    .catch(console.error)

  toggleLoading()
}

const remove = async (booking: BookedLandingRequestInterface) => {
  toggleLoading()

  const { id } = booking
  const url = `/bookings/${props.bookingId}/lendings/${id}`

  await $axios?.delete(url)
    .then(() => {
      refTable.value?.loadData()
    })
    .catch(console.error)

  toggleLoading()
}

onBeforeUnmount(() => {
  unwatchLending()
  unwatchCurrentPrice()
})
</script>