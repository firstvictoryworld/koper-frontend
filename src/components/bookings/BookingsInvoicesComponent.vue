<template>
  <CardContainer
    class="mt-5"
    :title="$t('bookings.edit.invoices.title')"
    :no-padding="true"
  >
    <DataTable ref="refTable" :cols="cols" :url="`/bookings/${props.bookingId}/invoices`" local-prefix="bookings.edit.invoices." total-title="Totale Fatture" total-column="amount">
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
        € {{ row.booking_file_invoice?.amount }}
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
import { inject, reactive, ref, computed, type GlobalComponents, type Ref } from 'vue'
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

// Data
const cols = reactive([
  { key: 'id' },
  { key: 'number' },
  { key: 'date' },
  { key: 'type' },
  { key: 'amount' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-download', handler(row: FileInterface) { download(row) }, btnProps: { loading: isDownloading, class: 'mr-3' } },
      { icon: 'mdi-delete', handler(row: FileInterface) { remove(row) }, color: 'red', btnProps: { loading: isDeleting, disabled: !!props.readonly } },
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
  { label: i18n.t('yes'), value: 1 },
  { label: i18n.t('no'), value: 0 },
]

const dialog = reactive({ 
  show: false,
  fields: {
    number: { value: undefined, binds: { rules: [requiredValidation], type: 'text', ...defaultInputBinds } },
    date: { value: undefined, binds: { rules: [requiredValidation], type: 'date', ...defaultInputBinds } },
    amount: { value: undefined, binds: { rules: [requiredValidation, currencyValidation], type: 'number', ...defaultInputBinds } },
    type: { value: undefined, binds: { type: 'select', rules: [requiredValidation], items: invoiceTypeOpt, itemTitle: 'label', itemValue: 'value', ...defaultInputBinds } },
    same_issuer: { value: undefined, binds: { rules: [requiredValidation], type: 'radio', ...defaultInputBinds }, size: 12, options: sameIssuerOptions },
    vat_number: { value: undefined, binds: { rules: [requiredValidation, pivaValidation], type: 'text', ...defaultInputBinds }, show: () => isDifferentEmitter.value },
    fiscal_code: { value: undefined, binds: { rules: [requiredValidation, codFiscaleOrPivaValidation], type: 'text', ...defaultInputBinds }, show: () => isDifferentEmitter.value },
    issuing_body: { value: undefined, binds: { rules: [requiredValidation], type: 'text', ...defaultInputBinds }, show: () => isDifferentEmitter.value, size: 12 },
    file: { value: undefined, binds: { rules: [], type: 'file', ...defaultInputBinds }, size: 12 },
  } as Record<string, FieldInterface>,
})

const formDialog = reactive({ 
  status: true,
  hasErrors: false
})

const $axios = inject(axiosInjectKey)

// Computed
const isDifferentEmitter = computed((): boolean => !!dialog.fields.same_issuer.value)

// Elements
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const refTable: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions
const add = () => {
  dialog.fields.file.value = undefined
  dialog.show = true
}

const download = (invoice: FileInterface) => {
  toggleDownload()

  const { id, filename } = invoice
  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}/bookings/${props.bookingId}/invoices/${id}`

  new JsFileDownloader({
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

  $axios?.delete(path)
    .then(() => {
      refTable.value?.loadData()
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

  const path = `/bookings/${props.bookingId}/invoices`
  const data = {}

  each(dialog.fields, (field, key) => {
    let { value, binds } = field
    if (binds.type === 'file' && value.length) {
      value = value[0]
    }
    Object.assign(data, {[key]: value})
  })

  const formData = serialize(data, {
    indices: true,
    booleansAsIntegers: true,
    allowEmptyArrays: true
  })

  $axios?.post(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then(() => {
      refTable.value?.loadData()
      dialog.show = false
      dialog.fields.file.value = false
    })
    .catch(console.error)

  toggleLoading()
}
</script>