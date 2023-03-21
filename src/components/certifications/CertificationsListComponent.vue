<template>
  <DataTable ref="refTable" :cols="cols" url="/uniquecertification" local-prefix="certifications.list." class="mt-5">
    <template #header v-if="usersStore.isFondo || usersStore.isBackoffice">
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="uploadFile.value = true" :loading=isLoading   >
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

    <template #col-filename="{ row }">
      {{ row.unique_certifications[0]?.filename }}
    </template>

    
  </DataTable>

  <FullDialog
    :show="doctor.id !== undefined"
    @close="() => doctor.id = undefined"
  >
    <template #title>{{ $t('certifications.edit.title') }}</template>

    <CertificationsEditComponent v-if="doctor.id !== undefined" class="mt-5" :doctor-id="doctor.id" :structure-id="structure.id" @updated="() => reload()" />
  </FullDialog>
  
  <FullDialog
    :show="uploadFile.value === true"
    @close="() => uploadFile.value = false"
  >
    <template #title>{{ $t('certifications.import.title') }}</template>
      
    <CertificationsImportComponent v-if="uploadFile.value === true" @updated="() => reload()" />
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
import CertificationsEditComponent from './CertificationsEditComponent.vue'
import CertificationsImportComponent from './CertificationsImportComponent.vue'
import JsFileDownloader from 'js-file-downloader'
import { useUsersStore } from '@/stores/users';
import { each } from 'lodash'

const usersStore = useUsersStore()

interface CertificationInterface {
  unique_certifications: any
}

const cols = reactive([
  { key: 'code' },
  { key: 'business_name' },
  { key: 'filename' },
  { label: '', key: '', actions:
    [
      ...(usersStore.isFondo || usersStore.isBackoffice ? [
      { icon: 'mdi-upload', handler(row: CertificationInterface) { show(row) }, color: 'yellow', btnProps: { class: 'mr-3' } },
      
      ] : []),
      { icon: 'mdi-download', handler(row: CertificationInterface) { download(row) }, btnProps: { class: 'mr-3 disabled'}  },  
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

const download = async (certification: CertificationInterface) => {
  toggleDownload()
  const id = certification.unique_certifications[0].id
  const filename =  certification.unique_certifications[0].filename
  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}/uniquecertification/${id}/download`
  await new JsFileDownloader({
      url,
      filename,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: usersStore.bearerToken }
      ],
    })
    .catch(console.error)

  toggleDownload()
}

const reload = () => {
  doctor.id = undefined
  refTable.value?.loadData()
}

onBeforeUnmount(() => {
  unwatchDoctorId()

})

</script>
