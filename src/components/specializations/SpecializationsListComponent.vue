<template>
  <DataTable ref="refTable" :cols="cols" url="/specializations" local-prefix="specializations.list." class="mt-5">
    <template #header>
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="() => specialization.id = null">
        {{ $t('add') }} 
      </v-btn>
    </template>
  </DataTable>

  <FullDialog
    :show="specialization.id !== undefined"
    @close="() => specialization.id = undefined"
  >
    <template #title>{{ $t('specializations.edit.title') }}</template>

    <SpecializationsEditComponent v-if="specialization.id !== undefined" class="mt-5" :specialization-id="specialization.id" @updated="() => reload()" />
  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { reactive, ref, type Ref } from 'vue'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import SpecializationsEditComponent from './SpecializationsEditComponent.vue'

const cols = reactive([
  { key: 'id' },
  { key: 'name' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) } }
    ]
  },
] as DatatableColInterface[])

const specialization = reactive({
  id: undefined as undefined|null|number
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const show = (row: Record<string, any>) => {
  specialization.id = row.id || null
}

const reload = () => {
  refTable.value?.loadData()
}

</script>
