<template>
  <DataTable ref="refTable" :cols="cols" url="/agreements" local-prefix="agreements.list." class="mt-5">
    <template #header>
      <v-btn v-if="!readonly" :disabled="disable" class="ml-3" variant="flat" color="koperniko-primary" @click="() => agreement.id = null">
        {{ $t('add') }} 
      </v-btn>
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="downloadExcel" :loading="isDownloading" :disabled="disable" >
        {{ $t('download') }} 
      </v-btn>
      <v-btn  v-if="usersStore.structureCompleted || usersStore.isBackoffice"  class="ml-3" variant="flat" color="koperniko-primary" @click="uploadFile.value = true" :loading="isLoading" :disabled="disable"  >
        {{ $t('upload') }} 
      </v-btn>
    </template>

    <template #col-checkbox="{row }">
      <v-checkbox  hide-details="auto" color="koperniko-secondary"
        variant="outlined"  density="compact" :value="row.id" v-model="ids"   
       />
    </template>

    <template #col-code="{ row }">
      {{ row.structure_data?.code }}
    </template>

    <template #col-structure="{ row }">
      {{ row.structure_data?.business_name }}
    </template>

    <template #col-status="{ row }">
      <v-icon v-if="AgreementStatusEnum.ACTIVE === row.status" color="green">mdi-check</v-icon>
      <v-icon v-else-if="AgreementStatusEnum.REJECTED === row.status" color="red">mdi-cancel</v-icon>
      <v-icon v-else-if="AgreementStatusEnum.CLOSED === row.status" color="red">mdi-minus-circle</v-icon>
      <v-icon v-else color="yellow-darken-3">mdi-timer-sand-complete</v-icon>
    </template>

    <template #col-active="{ row }">
      <v-icon v-if="row.active" color="green">mdi-check</v-icon>
      <v-icon v-else color="red">mdi-cancel</v-icon>
    </template>
  </DataTable>

  <FullDialog
    :show="agreement.id !== undefined"
    @close="() => agreement.id = undefined"
  >
    <template #title>{{ $t('agreements.edit.title') }}</template>

    <template #toolbar>
      <div id="agreement-toolbar-target" class="d-flex justify-center align-center"></div>
    </template>

    <AgreementsEditComponent v-if="agreement.id !== undefined" :agreement-id="agreement.id" @updated="() => reload()" />
  </FullDialog>

  <FullDialog
    :show="uploadFile.value === true"
    @close="() => uploadFile.value = false"
  >
    <template #title>{{ $t('agreements.import.title') }}</template>
      
    <AgreementsImportComponent v-if="uploadFile.value === true" @updated="() => reload()" />
  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import AgreementStatusEnum from '@/enums/AgreementStatusEnum'
import { useUsersStore } from '@/stores/users'
import { computed, inject, reactive, ref, type Ref } from 'vue'
import { useToggle } from '@vueuse/shared'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import JsFileDownloader from 'js-file-downloader'
import AgreementsEditComponent from './AgreementsEditComponent.vue'
import AgreementsImportComponent from  './AgreementsImportComponent.vue'

const usersStore = useUsersStore()

const cols = reactive([
  { key: 'checkbox' },
  { key: 'code' },
  { key: 'structure', },
  { key: 'lending_agreements_count', },
  { key: 'valid_from', },
  { key: 'valid_to', },
  { key: 'subscribed_at' },
  { key: 'status', },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) },  show:(row) => (AgreementStatusEnum.ACTIVE !== row.status && AgreementStatusEnum.CLOSED !== row.status) },
      { icon: 'mdi-eye', handler(row) { show(row) }, show:(row) => (AgreementStatusEnum.ACTIVE === row.status  || AgreementStatusEnum.CLOSED === row.status) }
    ]
  },
] as DatatableColInterface[])

const agreement = reactive({
  id: undefined as undefined|null|number
})

const uploadFile = reactive({
  value: undefined as undefined|null|boolean
})

const $axios = inject(axiosInjectKey)

// VueUse composables
const [isDownloading, toggleDownload] = useToggle()

// Computed
const readonly = computed(() => {
  return !usersStore.isStructureOrUser || !usersStore.structureCompleted 
})
// temporaneo
const disable = computed(() => {
  return import.meta.env.VITE_APP_ENV !== 'staging'
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)
const ids = ref([])

// Functions

const show = (row: Record<string, any>) => {
  agreement.id = row.id || null
}

const downloadExcel = async () => {
  toggleDownload()

  const { baseURL } = $axios?.defaults || {}

  const idsToString = ids.value.join(',')

  const url = `${baseURL}/export/agreements/${idsToString}`

  let date = new Date();
  let currentDate = date.getFullYear()+ "" + (date.getMonth() + 1) + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes();

  await new JsFileDownloader({
      url,
      filename: `agreements_${currentDate}.xlsx`,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: usersStore.bearerToken }
      ],
    })
    .catch(console.error)
  
  ids.value = []
  
  toggleDownload()
}

const reload = () => {
  refTable.value?.loadData()
}

</script>
