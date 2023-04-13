<template>
  <DataTable ref="refTable" :cols="cols" url="/users" :query-params="{ structure_data_id: props.structureId }" local-prefix="users.list." class="mt-5">
    <template #header v-if="!props.readonly">
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

  <ConfirmDialog
	  v-model:show="confirmDialogDetails.show"
	  v-model:title="confirmDialogDetails.title"
	  :message="$t('confirmDeleteMessage')"
		:rejectLabel="confirmDialogDetails.rejectLabel"
	  max-width="650"
		@confirm="confirmDelete"
		@cancel="cancelDelete"
	  />
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { reactive, ref, inject, type Ref } from 'vue'
import { useToggle } from '@vueuse/shared'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import StructureUsersEdit from './StructureUsersEditComponent.vue'
import ConfirmDialog from '../dialog/ConfirmDialog.vue'

interface Props {
  structureId?: number | null,
  readonly?: boolean | undefined
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

const confirmDialogDetails = reactive({
	show: false,
	title: '',
	message: '',
	rejectLabel: 'close'
})

const deleteRowId = ref(null);

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

  deleteRowId.value = row.id;
  // TODO confirm operation

  confirmDialogDetails.show = true;
}

const confirmDelete = async () => {
	confirmDialogDetails.show = false;

	toggleLoading()

	await $axios?.delete(`/users/${deleteRowId.value}`)
		.then(() => {
			refTable.value?.loadData()
		})
		.catch(console.error)


	deleteRowId.value = null;
	toggleLoading()
}

const cancelDelete = async () => {
	confirmDialogDetails.show = false;
	deleteRowId.value = null;
}
</script>
