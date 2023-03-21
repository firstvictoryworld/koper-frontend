<template>
  <DataTable ref="refShowTable" :cols="cols" :url="`/doctors/${doctorId}/lendings`" local-prefix="doctors.lending." class="mt-5">

    <template #col-specialization="{ row }">
      {{ row.doctors[0].specializations[0].name }}
    </template>

    <template #col-recovery="{ row }">
      <v-checkbox
        v-model="row.doctors[0].specializations[0].pivot.recovery"
        :true-value="1"
        false-value="0"
        hide-details="auto"
        disabled
      />
    </template>

    <template #col-interventions="{ row }">
      <v-checkbox
        v-model="row.doctors[0].specializations[0].pivot.interventions"
        :true-value="1"
        :false-value="0"
        hide-details="auto"
        disabled
      />
    </template>

    <template #col-cost="{ row }">
      {{ row.doctors[0].pivot.cost }}
    </template>

  </DataTable>

  <FullDialog
    :show="doctor.id !== undefined"
    @close="() => doctor.id = undefined"
  >
    <template #title>{{ $t('doctors.edit.title') }}</template>

  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { reactive, ref, inject, type Ref } from 'vue'
import { useToggle } from '@vueuse/shared'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'

const cols = reactive([
  { key: 'id' },
  { key: 'name' },
  { key: 'specialization' },
  { key: 'recovery' },
  { key: 'interventions' },
  { key: 'cost' },
  
  { label: '', key: '', actions:
    [
      { icon: 'mdi-delete', handler(row) { remove(row) }, color: 'red' },
    ]
  },
] as DatatableColInterface[])

const $axios = inject(axiosInjectKey)

const props = defineProps<{
  doctorId: null | string | number
}>()

const doctor = reactive({
  id: undefined as undefined|null|number
})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const refShowTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const remove = async (row: Record<string, any>) => {
  if (!row.id) { return }

  // TODO confirm operation

  toggleLoading()

  await $axios?.delete(`/doctors/${props.doctorId}/lendings/${row.id}`)
    .then(() => {
      refShowTable.value?.loadData()
    })
    .catch(console.error)

  toggleLoading()
}


const reload = () => {
  refShowTable.value?.loadData()
}

</script>
