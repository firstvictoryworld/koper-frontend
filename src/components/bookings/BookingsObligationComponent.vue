<template>
  <CardContainer
    class="mt-5"
    :title="$t('bookings.edit.obligations.title')"
    :no-padding="true"
  >
    <DataTable
      ref="refTable"
      :cols="obligationCols"
      :url="basePath"
      per-page="infinite"
      local-prefix="bookings.edit.obligations."
      :no-searchable="true"
      :parse-rows="parseRows"
      @loaded="({ rows }) => table.rows = rows"
    >
      <template #subheader>
        <div v-show="!completed" class="px-5">
          <v-alert type="warning">
            {{ $t('bookings.errors.missingDocs') }}
          </v-alert>
        </div>
      </template>

      <template #col-lendings="{ row }">
        <ul>
          <li v-for="(lending, i) of (row.lendings || [])" :key="i">
            {{ lending.name }}
          </li>
        </ul>
      </template>

      <template #col-type_obligation="{ row }">
        {{ row.file && row.file.path ? $t(`bookings.edit.obligations.types.${row.file.type_obligation}`) : '' }}
      </template>

      <template #col-required="{ row }">
        <v-icon v-if="row.required" color="green">mdi-check</v-icon>
        <v-icon v-else color="gray">mdi-x</v-icon>
      </template>

      <template #expandRow="{ row }">
        <div class="fund-description" v-html="row.description || $t('bookings.edit.obligations.noDescription')" />
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
          {{ $t('bookings.edit.obligations.editTitle') }}
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <v-btn icon dark @click="() => dialog.show = false" >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <v-form ref="formDialogEl" lazy-validation v-model="formDialog.status" @submit.prevent="upload">
          <v-row>
            <template v-for="(field, key) of dialog.fields" :key="key">
              <v-col v-if="!field.show || field.show()" cols="12" :md="field.size || 6">
                <v-file-input
                  v-if="field.binds.type === 'file'"
                  v-model="field.value"
                  v-bind="field.binds"
                  :label="$t(`bookings.edit.obligations.${key}`)"
                  prepend-icon=""
                  prepend-inner-icon="mdi-file"
                />

                <v-select
                  v-else-if="field.binds.type === 'select'"
                  v-model="field.value"
                  v-bind="field.binds"
                  :label="$t(`bookings.edit.obligations.${key}`)"
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
import { inject, reactive, ref, computed, type GlobalComponents, type Ref, watch, onBeforeUnmount } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import DataTable from '../common/DataTable.vue'
import JsFileDownloader from 'js-file-downloader'
import { useUsersStore } from '@/stores/users'
import { each, findIndex } from 'lodash'
import { useI18n } from 'vue-i18n'
import BookingFileTypeObligationEnum from '@/enums/BookingFileTypeObligationEnum'
import CardContainer from '../common/CardContainer.vue'

interface LendingInterface {
  name: string
}

interface FileInterface {
  type_obligation: number
  fund_id: number | string
  fund_description: string
  booking_file_id: null | number
  booking_id: string
  filename: null | string
  type: number
  path: null | string
}

interface BookingObligationInterface {
  id: number | string
  name: string
  description?: string
  code: string | number | null
  required: boolean
  lendings: LendingInterface[]
  file?: FileInterface | null
  ids?: any[]
  codes?: any[]
  showDetails?: boolean
}

const props = defineProps<{
  bookingId: number
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
const obligationCols = reactive([
  { key: 'name' },
  { key: 'lendings' },
  { key: 'type_obligation' },
  { key: 'required' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-information-outline', handler(row: BookingObligationInterface) { row.showDetails = !row.showDetails }, color: 'blue', btnProps: { class: 'mr-3' } },
      { icon: 'mdi-upload', handler(row: BookingObligationInterface) { add(row) }, color: 'yellow', btnProps: { loading: isDownloading, class: 'mr-3', disabled: !!props.readonly } , show: (row) => !row.file || !row.file.path },
      { icon: 'mdi-download', handler(row: BookingObligationInterface) { download(row) }, btnProps: { loading: isDownloading, class: 'mr-3' }, show: (row) => !!row.file && !!row.file.path },
      { icon: 'mdi-delete', handler(row: BookingObligationInterface) { remove(row) }, color: 'red', btnProps: { loading: isDeleting, disabled: (row) => !row.file || !row.file.path || !!props.readonly } },
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
  obligation: undefined as undefined | BookingObligationInterface,
  fields: {
    type_obligation: { value: undefined, binds: { type: 'select', rules: [requiredValidation], items: obligationTypes, itemTitle: 'label', itemValue: 'value', ...defaultInputBinds }, size: 12 },
    file: { value: undefined, binds: { rules: [requiredValidation], type: 'file', ...defaultInputBinds }, size: 12 },
  }  as Record<string, FieldInterface>,
})

const formDialog = reactive({ 
  status: true,
  hasErrors: false
})

const table = reactive({
  rows: [] as BookingObligationInterface[]
})

const emit = defineEmits(['status', 'updated']);

// Computed
const basePath = computed(() => `/bookings/${props.bookingId}/obligations`)
const completed = computed(() => findIndex(table.rows, (row) => row.required && !row.file?.path) < 0)

// Watchers
const unwatchComplete = watch(
  () => completed.value,
  (completed) => emit('status', completed),
  {
    immediate: true
  }
)

// Elements
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const refTable: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions
const parseRows = (rows: any[]) => {
  const _rows: any[] = []
  rows.forEach((row) => {
    const { code, id } = row
    const i = code ? findIndex(_rows, _row => _row.id === row.id || (_row.name === row.name && _row.description === row.description)) : -1
    if (i >= 0) {
      if (!_rows[i].codes.includes(code)) {
        _rows[i].codes.push(code)
      }
      if (!_rows[i].ids.includes(id)) {
        _rows[i].ids.push(id)
      }
      return
    }
    _rows.push({ ...row, codes:[code], ids: [id] })
  })
  return _rows
}

const add = (obligation: BookingObligationInterface) => {
  dialog.obligation = obligation
  dialog.show = true
}

const download = async (obligation: BookingObligationInterface) => {
  toggleDownload()

  if (!obligation.file || !obligation.file.filename) { return }

  const { booking_file_id, filename } = obligation.file
  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}${basePath.value}/${booking_file_id}`
  
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

  const path = `${basePath.value}/${obligation.file?.booking_file_id}`

  await $axios?.delete(path)
    .then(() => {
      reloadTable()
      emit('updated')
    })
    .catch(console.error)

  toggleDelete()
}

const upload = async () => {
  if (!formDialogEl.value || !$axios || !dialog.obligation) { return }

  await formDialogEl.value.validate()

  if (!formDialog.status) { return formDialog.hasErrors = true }

  formDialog.hasErrors = false

  toggleLoading()

  const path = basePath.value
  const data = {
    fund_id: dialog.obligation.id,
    fund_description: dialog.obligation.name,
    fund_description_long: dialog.obligation.description || '',
    booking_file_id: dialog.obligation.file?.booking_file_id,
    ids: dialog.obligation.ids,
    codes: dialog.obligation.codes,
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
})
</script>

<style lang="scss">
.fund-description {
  ul {
    padding-left: 15px
  }
}
</style>
