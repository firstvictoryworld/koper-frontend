<template>
  <DataTable ref="refTable" :cols="cols" url="/doctors" local-prefix="doctors.list." class="mt-5">
    <template #header>
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="() => doctor.id = null">
        {{ $t('add') }} 
      </v-btn>
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

    <DoctorsEditComponent v-if="doctor.id !== undefined" class="mt-5" :doctor-id="doctor.id" @updated="() => reload()" />
  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { reactive, ref, type Ref } from 'vue'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import DoctorsEditComponent from './DoctorsEditComponent.vue'

const cols = reactive([
  { key: 'id' },
  { key: 'name' },
  { key: 'surname' },
  { key: 'structure' },
  { key: 'fiscal_code' },
  { key: 'active' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) } }
    ]
  },
] as DatatableColInterface[])

const doctor = reactive({
  id: undefined as undefined|null|number
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const show = (row: Record<string, any>) => {
  doctor.id = row.id || null
}

const reload = () => {
  refTable.value?.loadData()
}

</script>
