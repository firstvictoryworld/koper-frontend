
<template>
  <DataTable ref="refTable" :cols="cols" url="/reconciliations" local-prefix="reconciliations.list." class="mt-5">
    <template #col-structure="{ row }">
      {{ row.structure_data?.business_name }}
    </template>
  </DataTable>

  <FullDialog
    :show="reconciliation.id !== undefined"
    @close="() => reconciliation.id = undefined"
  >

    <template #toolbar>
      <div id="reconciliation-toolbar-target" class="d-flex justify-center align-center"></div>
    </template>

  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { useUsersStore } from '@/stores/users'
import type { count } from 'console'
import { reactive, ref, type Ref } from 'vue'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'

const userData = useUsersStore()

const cols = reactive([
  { key: 'id' },
  { key: 'fund_id' },
  { key: 'structure' },
  { key: 'value_date' },
  { key: 'payment_value' },
] as DatatableColInterface[])

const reconciliation = reactive({
  id: undefined as undefined|null|number
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const show = (row: Record<string, any>) => {
  reconciliation.id = row.id || null
}

const reload = () => {
  refTable.value?.loadData()
}

</script>
