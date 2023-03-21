<template>
  <DataTable ref="refTable" :cols="cols" url="/users" :query-params="{ structure_data_id: props.structureId }" local-prefix="users.list." class="mt-5">
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

    <StructureUsersEdit v-if="user.id !== undefined" class="mt-5" :structure-id="props.structureId" :user-id="user.id" @updated="() => reload()" />

  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { reactive, ref, inject, type Ref } from 'vue'
import { useToggle } from '@vueuse/shared'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import StructureUsersEdit from './StructureUsersEditComponent.vue'

interface Props {
  structureId?: number | undefined,
}

const props = withDefaults(defineProps<Props>(), {})

const cols = reactive([
  { key: 'id' },
  { key: 'username' },
  { key: 'name' },
  { key: 'surname' },
  { key: 'email' },
  { key: 'email_verified_at' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) } },
      { icon: 'mdi-delete', color: 'red', handler(row) { remove(row) } }
    ]
  },
] as DatatableColInterface[])

const user = reactive({
  id: undefined as undefined|null|number
})

const $axios = inject(axiosInjectKey)

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const show = (row: Record<string, any>) => {
  user.id = row.id || null
}

const reload = () => {
  user.id = undefined
  refTable.value?.loadData()
}

const remove = async (row: Record<string, any>) => {
  if (!row.id) { return }

  // TODO confirm operation

  toggleLoading()

  await $axios?.delete(`/users/${row.id}`)
    .then(() => {
      refTable.value?.loadData()
    })
    .catch(console.error)

  toggleLoading()
}
</script>
