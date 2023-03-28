<template>
  <DataTable ref="refTable" :cols="cols" url="/doctors" local-prefix="doctors.list." class="mt-5">
    <template #header>
      <v-btn v-if="usersStore.structureCompleted || usersStore.isBackoffice" class="ml-3" variant="flat" color="koperniko-primary" @click="() => doctor.id = null">
        {{ $t('add') }} 
      </v-btn>
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="downloadExcel" :loading=isDownloading   >
        {{ $t('download') }} 
      </v-btn>
      <v-btn  v-if="usersStore.structureCompleted || usersStore.isBackoffice"  class="ml-3" variant="flat" color="koperniko-primary" @click="uploadFile.value = true" :loading=isLoading   >
        {{ $t('upload') }} 
      </v-btn>
    </template>

    <template #col-checkbox="{row }">
      <v-checkbox  hide-details="auto" color="koperniko-secondary"
        variant="outlined"  density="compact" :value="row.id" v-model="ids"   
       />
    </template>

    <template #col-structure="{ row }">
      {{ row.structure_data.business_name }}
    </template>

    <template #col-active="{ row }">
      <v-icon v-if="row.active" color="green">mdi-check</v-icon>
      <v-icon v-else color="red">mdi-cancel</v-icon>
    </template>
  </DataTable>

  <FullDialog
    :show="doctor.id !== undefined"
    @close="() => doctor.id = undefined"
  >
    <template #title>{{ $t('doctors.edit.title') }}</template>

    <DoctorsEditComponent v-if="doctor.id !== undefined" class="mt-5" :doctor-id="doctor.id" :structure-id="structure.id" @updated="() => reload()" />
  </FullDialog>
  
  <FullDialog
    :show="uploadFile.value === true"
    @close="() => uploadFile.value = false"
  >
    <template #title>{{ $t('doctors.import.title') }}</template>
      
    <DoctorsImportComponent v-if="uploadFile.value === true" @updated="() => reload()" />
  </FullDialog>

</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent, FieldInterface } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { requiredValidation } from '@/validation/rules'
import { reactive, ref, type Ref, inject, watch, onBeforeUnmount, type GlobalComponents } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import { useToggle } from '@vueuse/shared'
import DoctorsEditComponent from './DoctorsEditComponent.vue'
import DoctorsImportComponent from './DoctorsImportComponent.vue'
import JsFileDownloader from 'js-file-downloader'
import { useUsersStore } from '@/stores/users';
import { each } from 'lodash'

const usersStore = useUsersStore()

const cols = reactive([
  { key: 'checkbox' },
  { key: 'id' },
  { key: 'name' },
  { key: 'surname' },
  { key: 'structure' },
  { key: 'fiscal_code' },
  { key: 'active' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) }, btnProps: { class: 'mr-3' } },
      { icon: 'mdi-delete', handler(row) { remove(row) }, color: 'red' }
    ]
  },
] as DatatableColInterface[])

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto'
} as Partial<VInput>

const dialog = reactive({ 
  show: false,
  fields: {
    file: { value: undefined, binds: { rules: [requiredValidation], type: 'file', ...defaultInputBinds }, size: 12 },
  }  as Record<string, FieldInterface>,
})

const doctor = reactive({
  id: undefined as undefined|null|number
})

const structure = reactive({
  id: undefined as undefined|null|number
})

const uploadFile = reactive({
  value: undefined as undefined|null|boolean
})

const unwatchDoctorId = watch(()  => doctor.id, (id) =>{
  if (id) { return }
  if(usersStore.isStruttura || usersStore.isUtente) {structure.id = usersStore.userDetails?.structureId}
})

const $axios = inject(axiosInjectKey)

// VueUse composables
const [isDeleting, toggleDelete] = useToggle(false)
const [isDownloading, toggleDownload] = useToggle()
const [isLoading, toggleLoading] = useToggle()

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)
const ids = ref([])

const formDialog = reactive({ 
  status: true,
  hasErrors: false
})

// Functions

const show = (row: Record<string, any>) => {
  doctor.id = row.id || null
  structure.id = row.structure_data.id || null
 
}

const downloadExcel = async () => {
  toggleDownload()

  const { baseURL } = $axios?.defaults || {}

  const idsToString = ids.value.join(',')

  const url = `${baseURL}/export/doctors/${idsToString}`

  let date = new Date();
  let currentDate = date.getFullYear()+ "" + (date.getMonth() + 1) + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes();

  await new JsFileDownloader({
      url,
      filename: `doctors_${currentDate}.xlsx`,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: usersStore.bearerToken }
      ],
    })
    .catch(console.error)

  ids.value = []

  toggleDownload()
}

const remove = async (row: Record<string, any>) => {
  toggleDelete()
  const id  = row.id
  const path = `doctors/${id}`

  await $axios?.delete(path)
    .then(() => {
      refTable.value?.loadData()
    })
    .catch(console.error)

  toggleDelete()
}

const reload = () => {
  doctor.id = undefined
  refTable.value?.loadData()
}

onBeforeUnmount(() => {
  unwatchDoctorId()

})

</script>
