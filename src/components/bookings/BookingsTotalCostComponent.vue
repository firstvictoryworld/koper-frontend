<template>
  <CardContainer
    class="mt-5"
    :title="$t('bookings.edit.summary_cost.title')"
    :no-padding="true"
  >  
    <DataTable
      ref="refTable"
      :cols="cols"
      :url="`/bookings/${props.bookingId}/lendings/total`"
      local-prefix="bookings.edit.summary_cost."
      :noSearchable="true"
      @loaded="(data) => component.data = data"
    >
      <template #col-fund_code="{ row }">
        {{ row.lending_agreement?.lending?.fund_code }}
      </template>

      <template #col-name="{ row }">
        {{ row.lending_agreement?.lending?.name }}
      </template>

      <template #col-tax_percentage="{ row }">
        {{ (row.tax_percentage * 100).toFixed(0) }}
      </template>

      <template #totals>
        <div class="text-right">

          <hr class="my-3" />

          <div v-if="stampCount" class="mb-1">
            <strong class="mr-3">Bollo non rimborsabile</strong>
            <strong class="mr-3">n° {{ stampCount }} </strong> <b >Totale: € {{ stampValue }} </b>
          </div>

          <div class="text-right">
            <strong class="mr-3">{{ $t('bookings.edit.summary_totals.total') }}</strong>
            <strong>€ {{ totAmount }} </strong>
          </div>

          <div class="mt-1 text-right">
            <strong class="mr-3">{{ $t('bookings.edit.summary_totals.refund') }}</strong>
            <strong>€ {{ totRefundAmount }} </strong>
          </div>

          <div class="mt-1 text-right">
            <strong class="mr-3">{{ $t('bookings.edit.summary_totals.patient') }}</strong>
            <strong>€ {{ totPatientAmount }} </strong>
          </div>
        </div>
      </template>
    </DataTable>
  </CardContainer>
</template>

<script setup lang="ts">
import type { DatatableColInterface } from '@/@types'
import { reactive, ref, type GlobalComponents, type Ref, computed } from 'vue'
import DataTable from '../common/DataTable.vue'
import CardContainer from '../common/CardContainer.vue'

const props = defineProps<{
  bookingId: number
  readonly?: boolean
}>()

const cols = reactive([
  { key: 'fund_code' },
  { key: 'name' },
  { key: 'unit_amount' },
  { key: 'quantity' },
  { key: 'net_amount' },
  { key: 'tax_percentage' },
  { key: 'total_amount' },
  { key: 'refund_amount' },
  { key: 'patient_amount' },
] as DatatableColInterface[])

const component = reactive({
  data: undefined as undefined|Record<string, any>
})

// Computed
const totAmount = computed(() => {
  return component.data?.tot_total_amount.toFixed(2)
})

const totRefundAmount = computed(() => {
  return component.data?.tot_refund_amount.toFixed(2)
})

const totPatientAmount = computed(() => {
  return component.data?.tot_patient_amount.toFixed(2)
})

const stampCount = computed(() => {
  return component.data?.bollo.quantity || 0
})

const stampValue = computed(() => {
  return (component.data?.bollo.total_stamp || 0).toFixed(0)
})

// Elements
const refTable: Ref<null | GlobalComponents['VTable']> = ref(null)

// Functions
const reloadTable = () => {
  refTable.value?.loadData()
}

defineExpose({ reloadTable })
</script>