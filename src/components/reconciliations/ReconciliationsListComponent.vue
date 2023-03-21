
<template>
  <DataTable ref="refTable" :cols="cols" url="/reconciliations" local-prefix="reconciliations.list." class="mt-5" :no-searchable="true">
    <template #header>
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="downloadExcel" :loading="isDownloadingExport">
        {{ $t('download') }} 
      </v-btn>
    </template>
   
    <template #col-checkbox="{row }">
      <v-checkbox  hide-details="auto" color="koperniko-secondary"
        variant="outlined"  density="compact" :value="row.payment_id" v-model="ids"   
       />
    </template>
   
    <template #col-structure="{ row }">
      {{ row.structure_data?.business_name }}
    </template>

    <template #col-bookings="{ row }">
      {{ row.liquidations.length}}
    </template>
  </DataTable>

  <FullDialog
    :show="dialog.show"
    @close="() => (dialog.show = false) && (dialog.paymentSelected = null)"
  >
    <template #title>
      {{ $t(`reconciliations.details.title`) }}
    </template>

    <v-table style="max-width:1250px" class="mx-auto">
      <thead>
        <tr>
          <th>{{ $t(`reconciliations.details.fund_booking_id`) }}</th>
          <th>{{ $t(`reconciliations.details.fund_code_associate`) }}</th>
          <th>{{ $t(`reconciliations.details.fund_code_patient`) }}</th>
          <th>{{ $t(`reconciliations.details.payment_date`) }}</th>
          <th style="text-align: right;">{{ $t(`reconciliations.details.payment_value`) }}</th>
          <th style="width:10px"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(liquidation, i) of dialog.paymentSelected?.liquidations || []"
          :key="i"
        >
          <td>{{ liquidation.fund_booking_id }}</td>
          <td>{{ liquidation.fund_code_associate }}</td>
          <td>{{ liquidation.fund_code_patient }}</td>
          <td>{{ liquidation.payment_date }}</td>
          <td style="text-align: right;">{{ liquidation.payment_value }}</td>
          <td class="text-no-wrap">
            <v-btn
              :title="$t('reconciliations.details.download.report')"
              icon
              color="koperniko-primary"
              density="comfortable"
              :disabled="isDownloadingInvoices || (isDownloadingReport && (dialog.downloadingId !== liquidation.fund_booking_id))"
              :loading="isDownloadingReport && (dialog.downloadingId === liquidation.fund_booking_id)"
              @click="() => downloadReport(liquidation)"
            >
              <v-icon size="17">mdi-file-document-check-outline</v-icon> 
            </v-btn>

            <!-- <v-btn
            :title="$t('reconciliations.details.download.invoices')"
              icon
              color="koperniko-primary"
              density="comfortable"
              :disabled="(liquidation.booking?.booking_invoice_files_count || 0) <= 0 || isDownloadingReport || (isDownloadingInvoices && (dialog.downloadingId !== liquidation.fund_booking_id))"
              :loading="isDownloadingInvoices && (dialog.downloadingId === liquidation.fund_booking_id)"
              class="ml-2"
              @click="() => downloadInvoices(liquidation)"
            >
              <v-icon size="17">mdi-receipt</v-icon> 
            </v-btn> -->
          </td>
        </tr>
      </tbody>
    </v-table>

  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent, DatatableRowInterface } from '@/@types'
import { reactive, ref, type Ref, inject } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FullDialog from '@/components/common/FullDialog.vue'
import { useToggle } from '@vueuse/shared'
import JsFileDownloader from 'js-file-downloader'
import { axiosInjectKey } from '@/utils/axios'
import { useUsersStore } from '@/stores/users'

const userStore = useUsersStore()
const $axios = inject(axiosInjectKey)

// Togglers
const [isDownloadingExport, toggleDownloadExport] = useToggle()
const [isDownloadingReport, toggleDownloadReport] = useToggle()
const [isDownloadingInvoices, toggleDownloadInvoices] = useToggle()

// Values
const cols = reactive([
  { key: 'checkbox' },
  ...(userStore.isAdmin ? [
    { key: 'structure' },
    { key: 'convention_code' },
  ] : []),
  { key: 'recipient_iban' },
  { key: 'bookings' },
  { key: 'payment_date' },
  { key: 'value_date' },
  { key: 'payment_value' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-eye', handler(row) { show(row) } },
    ]
  },
] as DatatableColInterface[])

const dialog = reactive({
  show: false,
  paymentSelected: null as null | DatatableRowInterface,
  downloadingId: null as null | string
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)
const ids = ref([])

// Functions

const show = (row: DatatableRowInterface) => {
  dialog.paymentSelected = row
  dialog.show = true
}

const downloadReport = async (liquidation: Record<string, any>) => {
  toggleDownloadReport()

  const fundBookingId = liquidation.fund_booking_id

  dialog.downloadingId = fundBookingId

  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}/bookings/${fundBookingId}/liquidation-report`
  const filename = `lettera_liquidazione_${fundBookingId}.pdf`

  await new JsFileDownloader({
      url,
      filename,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: userStore.bearerToken }
      ],
    })
    .catch(console.error)

  dialog.downloadingId = null

  toggleDownloadReport()
}

const downloadInvoices = async (liquidation: Record<string, any>) => {
  toggleDownloadInvoices()

  const fundBookingId = liquidation.fund_booking_id

  dialog.downloadingId = fundBookingId

  const { baseURL } = $axios?.defaults || {}
  const url = `${baseURL}/bookings/${fundBookingId}/donwload-invoices`
  const filename = liquidation.booking.booking_invoice_files_count > 1
    ? `fatture_${fundBookingId}.zip`
    : `fattura_${fundBookingId}.pdf`

  await new JsFileDownloader({
      url,
      filename,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: userStore.bearerToken }
      ],
    })
    .catch(console.error)

  dialog.downloadingId = null

  toggleDownloadInvoices()
}

const downloadExcel = async () => {
  toggleDownloadExport()

  const { baseURL } = $axios?.defaults || {}

  const idsToString = ids.value.join(',')

  const url = `${baseURL}/export/reconciliations/${idsToString}`

  let date = new Date();
  let currentDate = date.getFullYear()+ "" + (date.getMonth() + 1) + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes();

  await new JsFileDownloader({
      url,
      filename: `reconciliations_${currentDate}.xlsx`,
      withCredentials: true,
      headers: [
        { name: 'Authorization', value: userStore.bearerToken }
      ],
    })
    .catch(console.error)

  ids.value = []

  toggleDownloadExport()
}

</script>
