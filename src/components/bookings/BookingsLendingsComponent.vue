<template>
  <CardContainer
    class="mt-5"
    :title="$t('bookings.edit.lendings.title')"
    :no-padding="true"
  >  
    <DataTable
      ref="refTable"
      :cols="cols"
      :url="`/bookings/${props.bookingId}/lendings`"
      local-prefix="bookings.edit.lendings."
      @loaded="(data) => table.data = data"
      :perPage="50"
    >
      <template #subheader>
        <div v-show="!completed" class="px-5">
          <v-alert type="warning">
            {{ $t('bookings.errors.missingLending') }}
          </v-alert>
        </div>
      </template>

      <template #header>
        <v-btn v-if="!readonly" size="large" color="koperniko-primary" :loading="isLoading" @click="() => add()"
          :disabled="disable.insert">
          {{ $t('add') }}
        </v-btn>
      </template>

      <template #col-checkbox="{ row }">
        <v-checkbox v-if="row.lending_agreement?.lendind?.checkbox" hide-details="auto" color="koperniko-secondary"
          variant="outlined" density="compact" 
        />
      </template>

      <template #col-fund_code="{ row }">
        {{ row.lending_agreement?.lending?.fund_code }}
      </template>

      <template #col-name="{ row }">
        {{ row.lending_agreement?.lending?.name }}
      </template>

      <template #col-primary="{ row }">
        <v-icon v-if="row.primary && primaryCheck(row.lending_agreement?.lending?.code || '-1')" color="green">mdi-check</v-icon>
        <span v-else />
      </template>

      <template #totals>
        <div class="text-right">
          <hr class="my-3" />

          <div v-if="stampCount" class="mb-1">
            <strong class="mr-3">Bollo non rimborsabile</strong>
            <strong class="mr-3">n° {{ stampCount }} </strong> <b >Totale: € {{ stampValue }} </b>
          </div>

          <div class="mt-1 text-right">
            <strong class="mr-3">Totale Prenotazioni</strong>
            <strong>€ {{ totAmount }} </strong>
          </div>
        </div>
      </template>
    </DataTable>
  </CardContainer>

  <v-dialog v-bind:model-value="dialog.show" :scrim="true" persistent transition="dialog-bottom-transition"
    max-width="1100">
    <v-card v-if="dialog.show" :loading="isLoading" color="grey-lighten-4">
      <v-toolbar dark color="koperniko-primary">
        <v-toolbar-title>
          {{ $t('bookings.edit.lendings.edit') }}
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <v-btn icon dark @click="() => dialog.show = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <CardContainer class="mb-5">
          <v-form ref="formDialogEl" lazy-validation v-model="formDialog.status" @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12">
                <LendingAgreementAutocompleteComponent v-model:value="dialog.lendings.selected" :return-object="true"
                  :binds="{ readonly: readonlyAction.value }" :lending-id="dialog.lendingsCategories.selected?.id"
                  :booking-id="bookingId" :structure-id="structureId" />
              </v-col>

              <v-col cols="12" v-if="dialog.lendings.selected?.lending?.parent_id == 1 && props.bookingType != BookingTypeEnum.ODONTOIATRICA">
                <SpecializationLendingAutocompleteComponent v-model:value="dialog.specializations.selected"
                  :return-object="true" :binds="{ readonly: readonlyAction.value }"
                  :lending-id="dialog.lendings?.selected?.lending?.id" :doctor-id="dialog.doctors.selected?.id"
                  :booking-id="props.bookingId" />
              </v-col>

              <v-col cols="12" v-if="dialog.lendings.selected?.lending?.parent_id == 1 && props.bookingType != BookingTypeEnum.ODONTOIATRICA">
                <DoctorLendingAutocompleteComponent v-model:value="dialog.doctors.selected" :return-object="true"
                  :binds="{ readonly: readonlyAction.value }" :specialization-id="dialog.specializations?.selected?.id"
                  :structure-id="structureId" :booking-id="props.bookingId" />
              </v-col>

              <template v-for="(field, key) of dialog.fields" :key="key">
                <v-col v-if="field.binds.type !== 'hidden' && (typeof field.show === 'function' ? field.show() : true)"
                  cols="12" :md="field.size || '4'">
                  <v-select v-if="field.binds.type === 'select'" v-model.number="field.value"
                    :label="$t(`bookings.edit.lendings.${key}`)" v-bind="field.binds" />

                  <v-text-field v-else-if="field.binds.type === 'number'" type="number" v-model.number="field.value"
                    :label="$t(`bookings.edit.lendings.${key}`)" v-bind="field.binds" class="hide-arrows" />

                  <v-checkbox
                    v-else-if="field.binds.type === 'checkbox'"
                    v-model="field.value"
                    :true-value="1"
                    :false-value="0"
                    :label="$t(`bookings.edit.lendings.${key}`)"
                    hide-details="auto"
                    v-bind="field.binds"
                  />
                  
                  <v-radio-group
                    v-else-if="field.binds.type === 'radio'"
                    v-model="field.value"
                    :label="$t(`bookings.edit.lendings.${key}`)"
                    hide-details="auto"
                    v-bind="field.binds"
                  >
                    <v-radio
                      v-for="v of field.values" :key="`radio.${key}.${v}`"
                      :label="$t(`bookings.edit.lendings.${key}_value_${v}`)"
                      :value="v"
                    />
                  </v-radio-group>

                  <v-text-field v-else v-model="field.value" :label="$t(`bookings.edit.lendings.${key}`)"
                    v-bind="field.binds" />
                </v-col>

              </template>
            </v-row>

            <v-col cols="12" v-if="dentistryCode.includes(dialog.lendings.selected?.lending?.fund_code || '')">
             <v-alert v-if="teethObbligation.show" type="warning">{{teethObbligation.message}}</v-alert>
              <BookingsLendingDentistryComponent v-model:value="dialog.teeth" class="mt-5" />
            </v-col>

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
</template>

<script setup lang="ts">
import type { DatatableColInterface } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { currencyValidation, requiredValidation } from '@/validation/rules'
import { useToggle } from '@vueuse/shared'
import { each, has } from 'lodash'
import { computed, inject, reactive, ref, onBeforeUnmount, watch, type GlobalComponents, type Ref, type ComputedRef } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import LendingAgreementAutocompleteComponent from '../autocomplete/LendingAgreementAutocompleteComponent.vue'
import DoctorLendingAutocompleteComponent from '../autocomplete/DoctorLendingAutocompleteComponent.vue'
import DataTable from '../common/DataTable.vue'
import type { LendingInterface } from '../tariff/LendingComponent.vue'
import BookingsLendingDentistryComponent from './BookingsLendingDentistryComponent.vue'
import CardContainer from '../common/CardContainer.vue'
import SpecializationLendingAutocompleteComponent from '../autocomplete/SpecializationLendingAutocompleteComponent.vue'
import BookingTypeEnum from '@/enums/BookingTypeEnum'
// import { useUsersStore } from '@/stores/users'

//store
// const usersStore = useUsersStore()

interface DoctorInterface {
  id?: number
  name: string
  surname: string
  lendings?: Array<LendingInterface & { pivot: Record<string, any> }>
}

interface AgreededLandingInterface {
  id: number
  refund_value: number
  agreeded_cost: number
  lending?: LendingInterface
}

interface LendingCategoryInterface {
  id: number
  lending?: LendingInterface
}

interface SpecializationInterface {
  id?: number
  name: string
  check_pregnancy: boolean
}

interface BookedLandingInterface {
  current_price: undefined | number
  iva: undefined | number
  quantity: number
  primary: undefined | number
  pregnancy: number
}

interface BookedLandingRequestInterface extends BookedLandingInterface {
  id: null | number
  lending_agreement?: AgreededLandingInterface
  doctor?: DoctorInterface
  specialization?: SpecializationInterface
  teeth?: number[]
}

type BookedLandingFieldsKeys = keyof BookedLandingInterface

type BookedLandingFieldsInterface = {
  [key in BookedLandingFieldsKeys]: {
    value: any
    values?: any[]
    show?: () => boolean
    size?: number
    binds: Record<string, any>
  }
}

const props = defineProps<{
  bookingId: number
  readonly?: boolean
  structureId: number
  bookingType: number
}>()

const readonlyAction = reactive({
  value: false
})


const $axios = inject(axiosInjectKey)

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto',
  readonly: readonlyAction.value
} as Partial<VInput>

const formDialog = reactive({
  status: true,
  hasErrors: false
})

const teethObbligation = reactive({
  show: false,
  message: ''
})

// Computed
const readonlyActions = computed(() => {
  return props.readonly
})

const cols = reactive([
  // { key: 'checkbox' },
  { key: 'fund_code' },
  { key: 'name' },
  { key: 'iva' },
  { key: 'quantity' },
  { key: 'current_price' },
  { key: 'primary' },
  {
    label: '', key: '', actions:
      [
        { icon: 'mdi-pencil', handler(row: BookedLandingRequestInterface) { show(row) }, btnProps: { class: 'mr-3', disabled: readonlyActions} },
        { icon: 'mdi-delete', handler(row: BookedLandingRequestInterface) { remove(row) }, color: 'red', btnProps: { disabled: readonlyActions} }
      ]
  },
] as DatatableColInterface[])

const dialog = reactive({
  show: false,
  id: null as null | number,
  fields: {
    current_price: { value: undefined, binds: { rules: [requiredValidation, currencyValidation], type: 'number', max: 1000000, ...defaultInputBinds } },
    iva: { value: undefined, binds: { rules: [requiredValidation], type: 'select', items: [0, 4, 5, 10, 22], ...defaultInputBinds } },
    quantity: { value: undefined, binds: { rules: [requiredValidation], type: 'number', ...defaultInputBinds } },
    primary: { value: undefined, values: [1, 0], binds: { rules: [requiredValidation], type: 'radio', ...defaultInputBinds }, show: () => showPrimary.value },
    pregnancy: { value: 0, binds: { rules: [], type: 'checkbox', ...defaultInputBinds }, show: () => showPregnancy.value },
  } as BookedLandingFieldsInterface,
  lendings: {
    selected: undefined as undefined | AgreededLandingInterface,
  },
  specializations: {
    selected: undefined as undefined | SpecializationInterface,
  },
  doctors: {
    selected: undefined as undefined | DoctorInterface,
  },
  lendingsCategories: {
    selected: undefined as undefined | LendingCategoryInterface,
  },
  teeth: [] as number[]
})

const table = reactive({
  data: undefined as undefined|Record<string, any>
})

const emit = defineEmits(['status', 'updated']);

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const refTable: Ref<null | GlobalComponents['VForm']> = ref(null)
const codeFreeCost = ['18', '19', '20', '6132', '6129', '2949', '99993', '99995', '99994', '99998', '2949', '6129', '2949', '99991', '99991']
const dentistryCode = ['2583', '2584', '2585', '2586', '2587', '2588', '2589', '2591', '2593', '2594', '2595', '2596', '2600',
  '2601', '2597', '2598', '2602', '2603', '2604', '2605', '2606', '2607', '2608', '2609', '2667', '2610', '2611', '2612', '2613', '2614',
  '2673', '2674', '2675', '2679', '2680', '2722', '2723', '2615', '2617', '2618', '2619', '2620', '2621', '2646', '2622', '2624', '2625',
  '2633', '2668', '2669', '2670', '2677', '2676', '2671', '2672', '2681', '2616', '2678', '2626', '2627', '2628', '2629', '2630', '2631', '2647']

const disable = reactive({
  insert: false
})

// Computed
const completed = computed(() => (table.data?.rows.length || 0) > 0)


const totAmount = computed(() => {
  return (table.data?.total_cost || 0).toFixed(2)
})

const stampCount = computed(() => {
  return table.data?.bollo?.quantity || 0
})

const stampValue = computed(() => {
  return (table.data?.bollo?.total_stamp || 0).toFixed(0)
})

const showPrimary: ComputedRef<boolean> = computed(() => {
  return primaryCheck(dialog.lendings.selected?.lending?.code || '-1')
})

const showPregnancy: ComputedRef<boolean> = computed(() => {
  return dialog.specializations.selected?.check_pregnancy || false
})

// Watchers
const unwatchComplete = watch(
  () => completed.value,
  (completed) => emit('status', completed),
  {
    immediate: true
  }
)

const unwatchLending = watch(
  () => dialog.lendings.selected,
  (lending: undefined | AgreededLandingInterface, _prevLending: undefined | AgreededLandingInterface) => {
    if (!lending) { return }
    if (codeFreeCost.includes(lending.lending?.fund_code || '')) { return }
    if (dentistryCode.includes(lending.lending?.fund_code || '')) {
      checkTeethObbligation()
    }

    if ((!_prevLending || _prevLending.id !== lending.id) && lending?.agreeded_cost !== undefined) {
      dialog.fields.current_price.value = lending.agreeded_cost
    }

    if (lending?.agreeded_cost !== undefined) {
      dialog.fields.current_price.binds.max = lending.agreeded_cost
    }
    
    if (lending.lending?.fund_code == '4') {
      disable.insert = true;
    }
  }
)

const unwatchCurrentPrice = watch(
  () => dialog.fields.current_price.value,
  (value: undefined | number) => {
    if (codeFreeCost.includes(dialog.lendings.selected?.lending?.fund_code || '')) { return }

    if (value && value > dialog.fields.current_price.binds.max) {
      dialog.fields.current_price.value = dialog.fields.current_price.binds.max
    }
  }
)

const unwatchDoctor = watch(
  () => dialog.doctors.selected,
  (doctor: undefined | DoctorInterface) => {
    if (dialog.id === null && doctor) {
      dialog.fields.current_price.value = doctor?.lendings?.at(0)?.pivot.cost || dialog.lendings.selected?.agreeded_cost
    }
  }
)

const unwatchReadonly = watch(
  () => props.readonly,
  (readonly) => {
    readonlyAction.value = !!readonly
  }
)

// Functions
const primaryCheck = (code: string) => /^(12|13)(\.[.0-9]+)?$/.test(code)

const add = () => {
  show({
    id: null,
    current_price: undefined,
    iva: 0,
    quantity: 1,
    lending_agreement: undefined,
    doctor: undefined,
    specialization: undefined,
    teeth: undefined,
    primary: !showPrimary.value ? 1 : undefined,
    pregnancy: 0
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

  dialog.teeth = bookingLending?.teeth?.split(',').map(Number) || [] // FIXME sta roba qua va fatta nel backend
  dialog.id = bookingLending.id

  dialog.show = true
}

const handleSubmit = async () => {
  if (!formDialogEl.value || !$axios) { return }

  await formDialogEl.value.validate()

  if (!formDialog.status) { return formDialog.hasErrors = true }

  formDialog.hasErrors = false

  toggleLoading()

  const { id } = dialog
  const url = `/bookings/${props.bookingId}/lendings${id ? `/${id}` : ''}`
  const method = /\/[0-9]+$/.test(url) ? 'put' : 'post'

  const data = {
    lending_agreement_id: dialog.lendings.selected?.id,
    doctor_id: dialog.doctors.selected?.id,
    specialization_id: dialog.specializations.selected?.id,
    fund_code: dialog.lendings.selected?.lending?.fund_code,
    teeth: dialog.teeth
  }
  each(dialog.fields, (field, key) => Object.assign(data, { [key]: field.value }))

  await $axios?.request({
    url,
    data,
    method
  })
    .then(() => {
      reloadTable()
      emit('updated')
      dialog.show = false
    })
    .catch(console.error)

  toggleLoading()
}

const remove = async (booking: BookedLandingRequestInterface) => {
  toggleLoading()
  disable.insert = false;
  const { id } = booking
  const url = `/bookings/${props.bookingId}/lendings/${id}`

  await $axios?.delete(url)
    .then(() => {
      reloadTable()
      emit('updated')
    })
    .catch(console.error)

  toggleLoading()
}

const checkTeethObbligation = async () => {

  
await $axios?.post(`bookings/${props.bookingId}/checkTeeth/${ dialog.lendings.selected?.lending?.fund_code}`)
  .then(({ data }) => {
    const { success, response } = data
    if(success) {teethObbligation.show=true }
    
    if (response.dettaglio=='S'){
      teethObbligation.message = 'I seguenti denti sono obbligatori: Singoli denti'
    }

    if (response.dettaglio=='N'){
      teethObbligation.message = 'I seguenti denti sono obbligatori: No dettaglio richiesto'
    }

    if (response.dettaglio=='E'){
      teethObbligation.message = 'I seguenti denti sono obbligatori: Emiarcata'
    }

    if (response.dettaglio=='M'){
      teethObbligation.message = 'I seguenti denti sono obbligatori: Multi denti (ad es. M4 attende 4 denti)'
    }

    if (response.dettaglio=='A'){
      teethObbligation.message = 'I seguenti denti sono obbligatori: Arcata'
    }
  
    emit('updated')      
  })

  .catch(console.error)

}


const reloadTable = () => {
  refTable.value?.loadData()
}

defineExpose({ reloadTable })

onBeforeUnmount(() => {
  unwatchComplete()
  unwatchLending()
  unwatchCurrentPrice()
  unwatchDoctor()
  unwatchReadonly()
})

</script>
