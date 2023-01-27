<template>
  <DataTable ref="refTable" :cols="cols" url="/users" local-prefix="users.list." class="mt-5">
    <template #header>
      <v-btn class="ml-3" variant="flat" color="koperniko-primary" @click="() => user.id = null">
        {{ $t('add') }} 
      </v-btn>
    </template>

    
  </DataTable>

  <FullDialog
    :show="user.id !== undefined"
    @close="() => user.id = undefined"
  >
    <template #title>{{ $t('users.edit.title') }}</template>

    <StructureUsersEdit v-if="user.id !== undefined" class="mt-5" :user-id="user.id" @updated="() => reload()" />

  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { reactive, ref, type Ref } from 'vue'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import StructureUsersEdit from './StructureUsersEditComponent.vue'

const cols = reactive([
  { key: 'id' },
  { key: 'name' },
  { key: 'surname' },
  { key: 'email' },
  { key: 'email_verified_at' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) } }
    ]
  },
] as DatatableColInterface[])

const user = reactive({
  id: undefined as undefined|null|number
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const show = (row: Record<string, any>) => {
  user.id = row.id || null
}

const reload = () => {
  refTable.value?.loadData()
}

</script>
