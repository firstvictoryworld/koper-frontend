
<template>
  <DataTable ref="refTable" :cols="cols" url="/bookings" local-prefix="bookings.list." class="mt-5">
    <template #header>
      <v-btn v-if="userData.isStruttura" class="ml-3" variant="flat" color="koperniko-primary" @click="() => booking.id = null">
        {{ $t('add') }} 
      </v-btn>
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

    <BookingsEditComponent v-if="booking.id !== undefined" class="mt-5" :booking-id="booking.id" @updated="() => reload()" @close="() => booking.id = undefined" />
  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import BookingStatusEnum from '@/enums/BookingStatusEnum'
import { useUsersStore } from '@/stores/users'
import { reactive, ref, type Ref } from 'vue'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import BookingsEditComponent from './BookingsEditComponent.vue'

const userData = useUsersStore()

const cols = reactive([
  { key: 'id' },
  { key: 'structure'},
  { key: 'fiscal_code' },
  { key: 'nominative' },
  { key: 'type' },
  { key: 'status' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) } }
    ]
  },
] as DatatableColInterface[])


const booking = reactive({
  id: undefined as undefined|null|number
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const show = (row: Record<string, any>) => {
  booking.id = row.id || null
}

const reload = () => {
  refTable.value?.loadData()
}

const statusColor = (status: number): undefined|string => {
  switch (status) {
    case BookingStatusEnum.DELIVERED:
      return 'blue'
    case BookingStatusEnum.ELIGIBLE:
      return 'green'
    case BookingStatusEnum.CANCELED:
    case BookingStatusEnum.REJECTED:
      return 'red'
    case BookingStatusEnum.TO_BE_VERIFIED:
      return 'orange'
    case BookingStatusEnum.DRAFT:
      return 'yellow-darken-1'
  }
}
</script>
