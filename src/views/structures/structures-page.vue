<template>
  <v-container>
    <PageDescription
      :title="$t('structures.registrations.title')"
      :subtitle="$t('structures.registrations.subtitle')"
    />

    <DataTable ref="refTable" :cols="cols" url="/registration-request" local-prefix="structures.registrations." class="mt-5">
      <template #col-status="{ row }">
        <v-icon v-if="StructureStatusEnum.COMPLETED === row.status" color="green">mdi-check-all</v-icon>
        <v-icon v-else-if="StructureStatusEnum.NOT_COMPLETED === row.status" color="grey">mdi-check</v-icon>
        <v-icon v-else-if="StructureStatusEnum.NOT_APPROVED === row.status" color="yellow-darken-3">mdi-new-box</v-icon>
        <v-icon v-else-if="StructureStatusEnum.REJECTED === row.status" color="red">mdi-cancel</v-icon>
      </template>
    </DataTable>
  </v-container>

  <FullDialog
    :show="structure.dialog"
    :loading="isLoading"
    @close="closeDialog"
  >
    <template #title>{{ $t('structures.edit.title') }}</template>

    <template #toolbar>
      <v-btn
        v-show="structure.status && structure.status !== StructureStatusEnum.REJECTED"
        variant="text"
        color="red"
        @click="() => structure.confirmRejection = true"
      >
        {{ $t('structures.edit.reject') }}
      </v-btn>

      <v-btn
        v-show="structure.status && structure.status === StructureStatusEnum.NOT_APPROVED"
        variant="text"
        @click="() => structure.confirmActivation = true"
      >
        {{ $t('structures.edit.activate') }}
      </v-btn>
    </template>

    <v-alert v-if="[StructureStatusEnum.NOT_COMPLETED, StructureStatusEnum.COMPLETED].includes(structure.status || 0)" type="success">{{ $t('structures.edit.approvedMessage') }}</v-alert>

    <v-alert v-else-if="structure.status === StructureStatusEnum.REJECTED" type="error">{{ $t('structures.edit.rejectedMessage') }}</v-alert>

    <RegistrationForm v-if="structure.id" :structure-id="structure.id" :readonly="true" class="my-5" />
  </FullDialog>

  <ConfirmDialog
    v-model:show="structure.confirmRejection"
    :message="$t('structures.edit.confirmRejection')"
    @confirm="() => updateStatus(StructureStatusEnum.REJECTED)"
  />

  <ConfirmDialog
    v-model:show="structure.confirmActivation"
    :message="$t('structures.edit.confirmActivation')"
    @confirm="() => updateStatus(StructureStatusEnum.NOT_COMPLETED)"
  />
</template>

<script setup lang="ts">
// FIXME clean and move to separated components
import type { DatatableColInterface, DatatableRowInterface, DatatableComponent } from '@/@types'
import DataTable from '@/components/common/DataTable.vue'
import FullDialog from '@/components/common/FullDialog.vue'
import PageDescription from '@/components/common/PageDescription.vue'
import ConfirmDialog from '@/components/dialog/ConfirmDialog.vue'
import RegistrationForm from '@/components/registration/RegistrationForm.vue'
import StructureStatusEnum from '@/enums/StructureStatusEnum'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { inject, reactive, ref, type Ref } from 'vue'

const $axios = inject(axiosInjectKey)

const cols = reactive([
  { key: 'id' },
  { key: 'business_name' },
  { key: 'fiscal_code' },
  { key: 'vat_number' },
  { key: 'status' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { showRequest(row) } }
    ]
  },
] as DatatableColInterface[])

const structure = reactive({
  dialog: false,
  confirmRejection: false,
  confirmActivation: false,
  id: null,
  status: null
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Functions

const showRequest = (row: DatatableRowInterface) => {
  structure.id = row.id
  structure.status = row.status
  structure.dialog = true
}

const closeDialog = () => {
  structure.dialog = false
  structure.id = null
  structure.status = null
}

const updateStatus = async (status: number) => {
  if (!structure.id) { return }

  toggleLoading()

  await $axios?.patch(`/registration-request/${structure.id}/status`, { status })
    .then(() => {})
    .catch(console.error)

  refTable.value?.loadData()

  closeDialog()

  toggleLoading()
}

</script>
