<template>
  <!-- Lending documents -->

  <DataTable
    :title="$t(`bookings.edit.lendings.documents.title`)"
    :cols="lendingCols"
    :url="`${basePath}/documents`"
    local-prefix="bookings.edit.lendings.documents."
    perPage="infinite"
  >
    <template #col-required="{ row }">
      <v-icon v-if="row.required" color="green">mdi-check</v-icon>
    </template>
  </DataTable>

  <!-- Documents uploaded -->

  <DataTable
    :title="$t(`bookings.edit.lendings.obligations.title`)"
    ref="refTable"
    :cols="obligationCols"
    :url="`${basePath}/obligations`"
    local-prefix="bookings.edit.lendings.obligations."
    class="mt-5"
  >
    <template #col-name="{ row }">
      {{ row.lending_document?.name }}
    </template>

    <template #col-type="{ row }">
      {{ $t(`bookings.edit.lendings.obligations.types.${row.booking_file_obbligation?.type_obligation}`) }}
    </template>
  </DataTable>

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
          {{ $t('bookings.edit.lendings.obligations.editTitle') }}
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
                  :label="$t(`bookings.edit.lendings.obligations.${key}`)"
                  prepend-icon=""
                  prepend-inner-icon="mdi-file"
                />

                <v-select
                  v-else-if="field.binds.type === 'select'"
                  v-model="field.value"
                  v-bind="field.binds"
                  :label="$t(`bookings.edit.lendings.obligations.${key}`)"
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
import { requiredValidation } from '@/validation/rules'
import { useToggle } from '@vueuse/shared'
import { serialize } from 'object-to-formdata'
import { inject, reactive, ref, computed, type GlobalComponents, type Ref } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import DataTable from '../common/DataTable.vue'
import JsFileDownloader from 'js-file-downloader'
import { useUsersStore } from '@/stores/users'
import { each } from 'lodash'
import { useI18n } from 'vue-i18n'
import BookingFileTypeObligationEnum from '@/enums/BookingFileTypeObligationEnum'

interface FileInterface {
  id: undefined | number
  filename: string
}

interface BookingFileObligationInterface {
  type_obligation: number
}

interface BookingObligationInterface extends FileInterface {
  booking_file_obligation: BookingFileObligationInterface
  lending_document?: LendingDocumentInterface
}

interface LendingDocumentInterface {
  id: number
  name: string
  required: 0 | 1
}

const props = defineProps<{
  bookingId: number
  lendingId: number
  readonly?: boolean
}>()

const userStore = useUsersStore()
const $axios = inject(axiosInjectKey)
const i18n = useI18n()

// Togglers
const [isLoading, toggleLoading] = useToggle()
const [isDownloading, toggleDownload] = useToggle()
const [isDeleting, toggleDelete] = useToggle()

// Data
const lendingCols = reactive([
  { key: 'name' },
  { key: 'required' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-upload', handler(row: LendingDocumentInterface) { add(row) }, btnProps: { disabled: !!props.readonly } },
    ]
  },
] as DatatableColInterface[])

const obligationCols = reactive([
  { key: 'type' },
  { key: 'filename' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-download', handler(row: BookingObligationInterface) { download(row) }, btnProps: { loading: isDownloading, class: 'mr-3' } },
      { icon: 'mdi-delete', handler(row: BookingObligationInterface) { remove(row) }, color: 'red', btnProps: { loading: isDeleting, disabled: !!props.readonly } },
    ]
  },
] as DatatableColInterface[])

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto'
} as Partial<VInput>

const obligationTypes = reactive([
  { label: i18n.t(`bookings.edit.lendings.obligations.types.${BookingFileTypeObligationEnum.X_RATE_PLATE}`), value: BookingFileTypeObligationEnum.X_RATE_PLATE },
  { label: i18n.t(`bookings.edit.lendings.obligations.types.${BookingFileTypeObligationEnum.ECG}`), value: BookingFileTypeObligationEnum.ECG },
  { label: i18n.t(`bookings.edit.lendings.obligations.types.${BookingFileTypeObligationEnum.OTHER}`), value: BookingFileTypeObligationEnum.OTHER },
])

const dialog = reactive({ 
  show: false,
  lendingDocumentId: undefined as undefined | number,
  fields: {
    type: { value: undefined, binds: { type: 'select', rules: [requiredValidation], items: obligationTypes, itemTitle: 'label', itemValue: 'value', ...defaultInputBinds }, size: 12 },
    file: { value: undefined, binds: { rules: [requiredValidation], type: 'file', ...defaultInputBinds }, size: 12 },
  }  as Record<string, FieldInterface>,
})

const formDialog = reactive({ 
  status: true,
  hasErrors: false
})

// Computed
const basePath = computed(() => `/bookings/${props.bookingId}/lendings/${props.lendingId}`)

// Elements
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const refTable: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions
const download = async (obligation: BookingObligationInterface) => {
  toggleDownload()

  const { id, filename } = obligation
  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}${basePath.value}/obligations/${id}`

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

const remove = async (obligation: BookingObligationInterface) => {
  toggleDelete()

  const { id } = obligation
  const path = `${basePath.value}/obligations/${id}`

  await $axios?.delete(path)
    .then(() => {
      refTable.value?.loadData()
    })
    .catch(console.error)

  toggleDelete()
}

const add = (document: LendingDocumentInterface) => {
  dialog.lendingDocumentId = document.id
  dialog.show = true
}

const handleSubmit = async () => {
  if (!formDialogEl.value || !$axios) { return }

  await formDialogEl.value.validate()

  if (!formDialog.status) { return formDialog.hasErrors = true }

  formDialog.hasErrors = false

  toggleLoading()

  const path = `${basePath.value}/obligations`
  const data = {
    lending_document_id: dialog.lendingDocumentId,
    type_obligation: dialog.fields.type.value
  }

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
    })
    .catch(console.error)

  toggleLoading()
}
</script>