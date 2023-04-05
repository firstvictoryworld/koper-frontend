<template>
  <DataTable ref="refTable" :cols="cols" url="/agreements" local-prefix="agreements.list." class="mt-5" @loaded="onLoaded" @selectAll="onSelectAll">
    <template #header>
      <v-btn v-if="!readonly" :disabled="disable" class="ml-3" variant="flat" color="koperniko-primary" @click="() => agreement.id = null">
        {{ $t('add') }} 
      </v-btn>
      <v-btn v-if="!usersStore.isAdmin" class="ml-3" variant="flat" color="koperniko-primary" @click="downloadExcel" :loading="isDownloading" :disabled="disable" >
        {{ $t('download') }} 
      </v-btn>
      <v-btn  v-if="usersStore.structureCompleted && !usersStore.isBackoffice"  class="ml-3" variant="flat" color="koperniko-primary" @click="uploadFile.value = true" :loading="isLoading" :disabled="disable"  >
        {{ $t('upload') }} 
      </v-btn>
    </template>

    <template #col-checkbox="{row }">
      <v-checkbox hide-details="auto" color="koperniko-secondary"
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
      
    <AgreementsImportComponent v-if="uploadFile.value === true" :structure_data_id="uploadFile.structure_data_id" @updated="() => reload()" />
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
import type { DatatableFilter, DatatableRowInterface } from '@/@types/dataTable'

const usersStore = useUsersStore()

// VueUse composables
const [isDownloading, toggleDownload] = useToggle()
const rowExporting = ref(null)
const rowDownloading = ref(null)

const cols = reactive([
  { key: 'checkbox', enableSelectAll: true, show: (!usersStore.isAdmin && !usersStore.isStructureOrUser) },
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
      { icon: 'mdi-eye', handler(row) { show(row) }, show:(row) => (AgreementStatusEnum.ACTIVE === row.status  || AgreementStatusEnum.CLOSED === row.status), btnProps: { class: 'mr-3' } },
	  { icon: 'mdi-upload', handler(row) { uploadFile.value = true; uploadFile.structure_data_id = row.structure_data_id }, show:(row) => usersStore.isBackoffice, btnProps: { color: 'yellow', class: 'mr-3' } },
	  { icon: 'mdi-download', handler(row) { downloadExcel(row) }, show:(row) => usersStore.isBackoffice, btnProps: { class: 'mr-3' }, loading: (row) => rowExporting.value == row.id },
	  { icon: 'mdi-file-document-check', handler(row) { downloadPDF(row) }, show:(row) => usersStore.isBackoffice || usersStore.isStructureOrUser, loading: (row) => rowDownloading.value == row.id },
    ]
  },
] as DatatableColInterface[])

const agreement = reactive({
  id: undefined as undefined|null|number
})

const uploadFile = reactive({
  value: undefined as undefined|null|boolean,
  structure_data_id: null as null|number
})

const $axios = inject(axiosInjectKey)

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
const ids = ref([] as any[])
const allSelect = ref(false)
const loadedData = ref({
	search: '',
	filters: [] as DatatableFilter[],
	rows: [] as DatatableRowInterface[]
});

// Functions

const onLoaded = (data: any) => {
	loadedData.value = data
	resetSelection()
}

const onSelectAll = (selected: boolean) => {
	allSelect.value = !!selected

	if (!!selected) {
		selectAllRows()
	} else {
		ids.value = []
	}
}

const selectAllRows = () => {
	ids.value = loadedData.value?.rows ? loadedData.value.rows.map(row => row.id) : []
}

const show = (row: Record<string, any>) => {
  agreement.id = row.id || null
}

const downloadExcel = async (row: DatatableRowInterface) => {
  console.log('row', row);
  if (row) {
	rowExporting.value = row.id
  } else {
	toggleDownload()
  }
  console.log('expor', rowExporting.value);

  const { baseURL } = $axios?.defaults || {}

  const searchParams = new URLSearchParams()
  let idsToString = '';
  if (row) {
    searchParams.append('structure_data_id', row.structure_data_id);
  } else {
    idsToString = allSelect.value && (loadedData.value.search || loadedData.value.filters.length) ? 'all' : ids.value.join(',')
    searchParams.append('search', loadedData.value.search)
    if (loadedData.value.filters && loadedData.value.filters.length) {
      loadedData.value.filters.forEach(filter => {
        filter.values.forEach(value => {
          searchParams.append(`${filter.key}[]`, value.toString())
        })
      })
    }
    
  }

  const queryParams = row || idsToString == 'all' ? searchParams.toString() : '';

  const url = `${baseURL}/export/agreements/${!row ? idsToString : ''}?${queryParams}`

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
  
  resetSelection()
  
  if (row) {
		rowExporting.value = null
  } else {
		toggleDownload()
	}
}

const downloadPDF = async (row: Record<string, any>) => {
	rowDownloading.value = row.id

	const { baseURL } = $axios?.defaults || {}
	const url = `${baseURL}/agreements/${row.id}/download`

	await new JsFileDownloader({
		url,
		filename: `agreement_${row.id}.pdf`,
		withCredentials: true,
		headers: [
			{ name: 'Authorization', value: usersStore.bearerToken }
		],
	})
		.catch(console.error)

	rowDownloading.value = null
}

const resetSelection = () => {
	ids.value = []

	refTable.value?.resetSelectAll()
}

const reload = () => {
  refTable.value?.loadData()
}

</script>
