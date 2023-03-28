<template>
  <CardContainer
    class="mt-5"
    :title="$t('bookings.edit.invoices.title')"
    :no-padding="true"
  >
    <DataTable
      ref="refTable"
      :cols="cols"
      :url="`/bookings/${props.bookingId}/invoices`"
      local-prefix="bookings.edit.invoices."
      @loaded="(data) => table.data = data"
      :perPage="50"
    >
      <template #subheader>
        <div v-show="!completed" class="px-5">
          <v-alert type="warning">
            {{ $t('bookings.errors.missingDoc') }}
          </v-alert>
        </div>
      </template>

      <template #header>
        <v-btn v-if="!readonly" type="button" size="large" color="koperniko-primary" @click.prevent="() => add()">
          {{ $t('add') }}
        </v-btn>
      </template>

      <template #col-type="{ row }">
        {{ $t(`bookings.edit.invoices.types.${row.type}`) }}
      </template>

      <template #col-number="{ row }">
        {{ row.booking_file_invoice?.number }}
      </template>

      <template #col-date="{ row }">
        {{ row.booking_file_invoice?.date }}
      </template>

      <template #col-amount="{ row }">
        {{ row.booking_file_invoice?.amount }}
      </template>

      <template #col-stamp="{ row }">
        {{ row.booking_file_invoice?.stamp }}
      </template>

      <template #totals>
        <div class="text-right">
          <hr class="my-3" />

          <div v-if="stampCount" class="mb-1">
            <strong class="mr-3">Bollo non rimborsabile</strong>
            <strong class="mr-3">n° {{ stampCount }} </strong> <b >Totale: € {{ stampValue }} </b>
          </div>

          <div class="mt-1 text-right">
            <strong class="mr-3">Totale Fatture</strong>
            <strong>€ {{ totAmount }} </strong>
          </div>
        </div>
      </template>
    </DataTable>
  </CardContainer>

  <v-dialog
    v-bind:model-value="dialog.show"
    :scrim="true"
    persistent
    transition="dialog-bottom-transition"
    max-width="480"
  >
    <v-card v-if="dialog.show" :loading="isLoading" color="grey-lighten-4">
      <v-toolbar
        dark
        color="koperniko-primary"
      >
        <v-toolbar-title>
          {{ $t('bookings.edit.invoices.edit') }}
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <v-btn icon dark @click="() => dialog.show = false" >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <v-form ref="formDialogEl" lazy-validation v-model="formDialog.status" @submit.prevent="handleSubmit">
          <v-row>
            <template v-for="(field, key) of dialog.fields" :key="key">
              <v-col v-if="!field.show || field.show()" cols="12" :md="field.size || 6">
                <v-file-input
                  v-if="field.binds.type === 'file'"
                  v-model="field.value"
                  v-bind="field.binds"
                  :label="$t(`bookings.edit.invoices.${key}`)"
                  prepend-icon=""
                  prepend-inner-icon="mdi-file"
                />

                <v-radio-group
                  v-else-if="field.binds.type === 'radio'"
                  v-model="field.value"
                  v-bind="field.binds"
                  inline 
                  :label="$t(`bookings.edit.invoices.${key}`)"
                >
                  <v-radio v-for="(options, i) of (field.options || [])" :key="`${key}-${i}`" :label="options.label" :value="options.value" />
                </v-radio-group>

                <v-select
                  v-else-if="field.binds.type === 'select'"
                  v-model="field.value"
                  v-bind="field.binds"
                  :label="$t(`bookings.edit.${key}`)"
                />

                <v-text-field
                  v-else-if="field.binds.type === 'number'"
                  v-model.number="field.value"
                  v-bind="field.binds"
                  :label="$t(`bookings.edit.invoices.${key}`)"
                  class="hide-arrows"
                />

                <v-text-field
                  v-else
                  v-model="field.value"
                  v-bind="field.binds"
                  :label="$t(`bookings.edit.invoices.${key}`)"
                />
              </v-col>
            </template>
          </v-row>

          <v-divider class="my-5" />

          <div class="d-flex justify-end">
            <v-btn type="submit" size="large" color="koperniko-primary" :loading="isLoading">
              {{ $t('confirm') }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, FieldInterface } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { codFiscaleOrPivaValidation, currencyValidation, pivaValidation, requiredValidation } from '@/validation/rules'
import { useToggle } from '@vueuse/shared'
import { serialize } from 'object-to-formdata'
import { inject, reactive, ref, computed, type GlobalComponents, type Ref, onBeforeUnmount, watch } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import CardContainer from '../common/CardContainer.vue'
import DataTable from '../common/DataTable.vue'
import JsFileDownloader from 'js-file-downloader'
import { useUsersStore } from '@/stores/users'
import InvoiceType from '@/enums/InvoiceTypeEnum'
import { useI18n } from 'vue-i18n'
import { each } from 'lodash'

interface FileInterface {
  id: undefined | number
  filename: string
}

const props = defineProps<{
  bookingId: number
  readonly?: boolean
}>()

const userStore = useUsersStore()
const i18n = useI18n()

// Togglers
const [isLoading, toggleLoading] = useToggle()
const [isDownloading, toggleDownload] = useToggle()
const [isDeleting, toggleDelete] = useToggle()

const readonlyAction = reactive({
  value: false
})

// Computed
const readonlyActions = computed(() => {
  return props.readonly
})


// Data
const cols = reactive([
  { key: 'id' },
  { key: 'number' },
  { key: 'date' },
  { key: 'type' },
  { key: 'amount' },
  { key: 'stamp' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-download', handler(row: FileInterface) { download(row) }, btnProps: { loading: isDownloading, class: 'mr-3' }, show: (row) => row.filename  },
      { icon: 'mdi-upload', handler(row: FileInterface) { show(row) }, color: 'yellow', btnProps: { loading: isDownloading, class: 'mr-3' }, show: (row) => !row.filename },
      { icon: 'mdi-delete', handler(row: FileInterface) { remove(row) }, color: 'red', btnProps: { loading: isDeleting, disabled: readonlyActions } }
    ]
  },
] as DatatableColInterface[])

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto'
} as Partial<VInput>


const invoiceTypeOpt = reactive([
  { label: i18n.t(`bookings.edit.invoices.types.${InvoiceType.ADVANCE}`), value: InvoiceType.ADVANCE },
  { label: i18n.t(`bookings.edit.invoices.types.${InvoiceType.BALANCE}`), value: InvoiceType.BALANCE },
  { label: i18n.t(`bookings.edit.invoices.types.${InvoiceType.REVERSAL}`), value: InvoiceType.REVERSAL },
])

const sameIssuerOptions = [
  { label: i18n.t('yes'), value: 0 },
  { label: i18n.t('no'), value: 1 },
]

const dialog = reactive({ 
  show: false,
  id: undefined as undefined | number,
  fields: {
    number: { value: undefined, binds: { rules: [requiredValidation], type: 'text', ...defaultInputBinds }, show: () => !uploadOnly.value },
    date: { value: undefined, binds: { rules: [requiredValidation], type: 'date', ...defaultInputBinds, max: (new Date().toISOString().split("T")[0]) }, show: () => !uploadOnly.value },
    amount: { value: undefined, binds: { rules: [requiredValidation, currencyValidation], type: 'number', ...defaultInputBinds }, show: () => !uploadOnly.value },
    type: { value: undefined, binds: { type: 'select', rules: [requiredValidation], items: invoiceTypeOpt, itemTitle: 'label', itemValue: 'value', ...defaultInputBinds }, show: () => !uploadOnly.value },
    same_issuer: { value: undefined, binds: { rules: [requiredValidation], type: 'radio', ...defaultInputBinds }, size: 12, options: sameIssuerOptions, show: () => !uploadOnly.value },
    vat_number: { value: undefined, binds: { rules: [requiredValidation, pivaValidation], type: 'text', ...defaultInputBinds }, show: () => isDifferentEmitter.value && !uploadOnly.value },
    fiscal_code: { value: undefined, binds: { rules: [requiredValidation, codFiscaleOrPivaValidation], type: 'text', ...defaultInputBinds }, show: () => isDifferentEmitter.value && !uploadOnly.value },
    issuing_body: { value: undefined, binds: { rules: [requiredValidation], type: 'text', ...defaultInputBinds }, show: () => isDifferentEmitter.value && !uploadOnly.value, size: 12 },
    file: { value: undefined, binds: { rules: [(value: any) => !uploadOnly.value || requiredValidation(value)], type: 'file', ...defaultInputBinds }, size: 12 },
  } as Record<string, FieldInterface>,
})

const formDialog = reactive({ 
  status: null,
  hasErrors: false
})

const table = reactive({
  data: undefined as undefined|Record<string, any>
})

const $axios = inject(axiosInjectKey)

const emit = defineEmits(['status', 'updated']);

// Computed
const isDifferentEmitter = computed((): boolean => dialog.fields.same_issuer.value == undefined ? false :  !dialog.fields.same_issuer.value)
const uploadOnly = computed((): boolean => dialog.id !== undefined)


const completed = computed(() => {
  var value = (table.data?.rows.length || 0) > 0;
  // (table.data?.rows || []).forEach((_row: FileInterface) => {
  //   if ( row.filename === null ) { value = false }
  // })
  return value
}); 

const totAmount = computed(() => {
  return (table.data?.total_cost || 0).toFixed(2)
})

const stampCount = computed(() => {
  return table.data?.bollo?.quantity || 0
})

const stampValue = computed(() => {
  return (table.data?.bollo?.total_stamp || 0).toFixed(0)
})

// Watchers
const unwatchComplete = watch(
  () => completed.value,
  (completed) => emit('status', completed),
  {
    immediate: true
  }
)

const unwatchReadonly = watch(()  => props.readonly, (readonly) =>{
  if(readonly){ readonlyActions.v = true}
  else { readonlyAction.value = false }
})

// Elements
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const refTable: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions
const add = () => {
  dialog.fields.date.value = undefined
  dialog.fields.amount.value = undefined
  dialog.fields.number.value = undefined
  dialog.fields.type.value = undefined
  dialog.fields.same_issuer.value = undefined
  dialog.fields.vat_number.value = undefined
  dialog.fields.fiscal_code.value = undefined
  dialog.fields.issuing_body.value = undefined
  dialog.fields.file.value = undefined
  dialog.id = undefined
  dialog.show = true
}

const show = (row: any) => {
  dialog.id = row.id
  dialog.show = true
}

const download = async (invoice: FileInterface) => {
  toggleDownload()

  const { id, filename } = invoice
  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}/bookings/${props.bookingId}/invoices/${id}`

  await new JsFileDownloader({
      url,
      filename,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: userStore.bearerToken }
      ],
    })
    .catch(console.error)

  toggleDownload()
}

const remove = async (invoice: FileInterface) => {
  toggleDelete()

  const { id } = invoice
  const path = `/bookings/${props.bookingId}/invoices/${id}`

  await $axios?.delete(path)
    .then(() => {
      reloadTable()
      emit('updated')
    })
    .catch(console.error)

  toggleDelete()
}

const handleSubmit = async () => {
  if (!formDialogEl.value || !$axios) { return }

  await formDialogEl.value.validate()

  if (!formDialog.status) { return formDialog.hasErrors = true }

  formDialog.hasErrors = false

  toggleLoading()

  const { id } = dialog
  const path = `/bookings/${props.bookingId}/invoices${id ? `/${id}` : ''}`
  const data = {}

  each(dialog.fields, (field, key) => {
    let { value, binds } = field
    if (binds.type === 'file' && Array.isArray(value)) {
      value = value[0] ?? null
    }

    Object.assign(data, {[key]: value})
  })

  const formData = serialize(data, {
    indices: true,
    booleansAsIntegers: true,
    allowEmptyArrays: true
  })
 
  await $axios?.post(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then(() => {
      reloadTable()
      emit('updated')
      dialog.show = false
    })
    .catch(console.error)

  toggleLoading()
}

const reloadTable = () => {
  refTable.value?.loadData()
}

defineExpose({ reloadTable })

onBeforeUnmount(() => {
  unwatchComplete()
  unwatchReadonly()
})
</script>