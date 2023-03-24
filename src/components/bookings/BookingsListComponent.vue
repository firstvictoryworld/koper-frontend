
<template>
  <DataTable ref="refTable" :cols="cols" url="/bookings" local-prefix="bookings.list." class="mt-5" @loaded="onLoaded" @selectAll="onSelectAll">
    <template #header>
      <v-btn v-if="userStore.isStruttura || userStore.isUtente" class="ml-3" variant="flat" color="koperniko-primary" @click="() => booking.id = null">
        {{ $t('add') }} 
      </v-btn>
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="downloadExcel" :loading=isDownloading   >
        {{ $t('download') }} 
      </v-btn>
    
    </template>
    <template #col-checkbox="{row }">
      <v-checkbox  hide-details="auto" color="koperniko-secondary"
        variant="outlined"  density="compact" :value="row.id" v-model="ids"   
       />
    </template>

    <template #col-id="{ row }">
      {{ row.fund_id ?? row.id }}
    </template>

    <template #col-structure="{ row }">
      {{ row.structure_data.business_name }}
    </template>

    <template #col-fiscal_code="{ row }">
      {{ row.patient.fiscal_code }}
    </template>

    <template #col-nominative="{ row }">
      {{ row.patient.name }} {{ row.patient.surname }}
    </template>

    <template #col-type="{ row }">
      {{ row.type ? $t(`bookings.types.${row.type}`) : '' }}
    </template>

    <template #col-status="{ row }">
      <v-chip
        :color="statusColor(row.status)"
      >
        {{ $t(`bookings.status.${row.status}`) }}
      </v-chip>
    </template>
  </DataTable>

  <FullDialog
    :show="booking.id !== undefined"
    @close="() => booking.id = undefined"
  >
    <template #title>{{ $t('bookings.edit.title') }}</template>

    <template #toolbar>
      <div id="booking-toolbar-target" class="d-flex justify-center align-center"></div>
    </template>

    <BookingsEditComponent v-if="booking.id !== undefined" :readonly="readonly.value" class="mt-5" :booking-id="booking.id" :structure-id="structureData.id" @updated="() => reload()" @close="() => booking.id = undefined" />
  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import BookingStatusEnum from '@/enums/BookingStatusEnum'
import { useUsersStore } from '@/stores/users'
import {inject, reactive, ref, type Ref } from 'vue'
import { each, forEach, get, mapValues, set } from 'lodash'
import DataTable from '@/components/common/DataTable.vue'
import FullDialog from '@/components/common/FullDialog.vue'
import BookingsEditComponent from './BookingsEditComponent.vue'
import { useToggle } from '@vueuse/shared'
import { axiosInjectKey } from '@/utils/axios';
import JsFileDownloader from 'js-file-downloader'
import useBooking from '@/use/useBooking'
import BookingTypeEnum from '@/enums/BookingTypeEnum'
import i18n from '@/locales'
import type { DatatableFilter, DatatableRowInterface } from '@/@types/dataTable'

const userStore = useUsersStore()

const [isDownloading, toggleDownload] = useToggle()

const $axios = inject(axiosInjectKey)

const bookingTypes = [
	BookingTypeEnum.AMBULATORIO,
	BookingTypeEnum.RICOVERO,
	BookingTypeEnum.ODONTOIATRICA,
	BookingTypeEnum.PREVENZIONE,
	BookingTypeEnum.GRAVI_MALATTIE
]

const bookingStatuses = [
	BookingStatusEnum.DRAFT,
	BookingStatusEnum.APPROVED,
	BookingStatusEnum.BLOCKED,
	BookingStatusEnum.REJECTED,
	BookingStatusEnum.INTEGRATED,
	BookingStatusEnum.CONCLUDED,
	BookingStatusEnum.SUSPENDED,
	BookingStatusEnum.PRESENTED_TO_THE_FUND,
	BookingStatusEnum.IN_REVIEW,
]

const cols = reactive([
  { key: 'checkbox', enableSelectAll: true },
  { key: 'id' },
  ...(userStore.isAdmin ? [
    { key: 'structure' },
   
  ] : []),
  { key: 'fiscal_code' },
  { key: 'nominative' },
  { key: 'type', enableFilter: true, filterOptions: bookingTypes.map(type => ({ label: i18n.global.t(`bookings.types.${type}`), value: type })) },
  { key: 'created_at'},
  { key: 'status', enableFilter: true, filterOptions: bookingStatuses.map(status => ({ label: i18n.global.t(`bookings.status.${status}`), value: status })) },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) }, btnProps: { class: 'mr-3' }, show: (row) => row.status !=  BookingStatusEnum.PRESENTED_TO_THE_FUND },
      { icon: 'mdi-eye', handler(row) { show(row) }, btnProps: {class: 'mr-3' }, show: (row) => row.status ===  BookingStatusEnum.PRESENTED_TO_THE_FUND },
      { icon: 'mdi-download', handler(row) { downloadPDF(row) }, btnProps: { loading: isDownloading } },
    ]
  },
] as DatatableColInterface[])


const booking = reactive({
  id: undefined as undefined|null|number
})

const structureData = reactive({
  id: null
})

const readonly = reactive({
  value: false
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
  booking.id = row.id || null
  readonly.value =  userStore.isFondo ? false : row.status === BookingStatusEnum.PRESENTED_TO_THE_FUND
  structureData.id = row.structure_data.id || null
}

const downloadPDF = async (row: Record<string, any>) => {
  toggleDownload()

  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}/bookings/${row.id}/download`

  await new JsFileDownloader({
      url,
      filename: `booking_number_${row.id}.pdf`,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: userStore.bearerToken }
      ],
    })
    .catch(console.error)

  toggleDownload()
}

const downloadExcel = async () => {
  toggleDownload()

  const { baseURL } = $axios?.defaults || {}

  const idsToString = allSelect.value && (loadedData.value.search || loadedData.value.filters.length) ? 'all' : ids.value.join(',')
  const searchParams = new URLSearchParams()
  searchParams.append('search', loadedData.value.search)
  if (loadedData.value.filters && loadedData.value.filters.length) {
	loadedData.value.filters.forEach(filter => {
		filter.values.forEach(value => {
			searchParams.append(`${filter.key}[]`, value.toString())
		})
	})
  }
  const queryParams = idsToString == 'all' ? searchParams.toString() : '';

  const url = `${baseURL}/export/bookings/${idsToString}?${queryParams}`

  let date = new Date();
  let currentDate = date.getFullYear()+ "" + (date.getMonth() + 1) + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes();

  await new JsFileDownloader({
      url,
      filename: `bookings_${currentDate}.xlsx`,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: userStore.bearerToken }
      ],
    })
    .catch(console.error)

  resetSelection()

  toggleDownload()
}

const resetSelection = () => {
	ids.value = []

	refTable.value?.resetSelectAll()
}

const reload = () => {
  refTable.value?.loadData()
}

const { statusColor } = useBooking()

</script>
