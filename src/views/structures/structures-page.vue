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
        <v-icon v-else-if="StructureStatusEnum.CLOSED === row.status" color="red">mdi-minus-circle</v-icon>
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

    <v-card class="mt-5" :rounded="50">
      <v-tabs
        v-model="tabs.value"
        bg-color="koperniko-primary"
        center-active
        show-arrows
      >
        <v-tab value="structure">{{ $t('registry.tabs.structure') }}</v-tab>
        <v-tab value="users">{{ $t('registry.tabs.users') }}</v-tab>

        <v-tab value="bank">{{ $t('registry.tabs.bankAccount') }}</v-tab>
        <v-tab value="contacts">{{ $t('registry.tabs.contacts') }}</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tabs.value" class="pt-1">

          <v-window-item value="structure">
            <StructureDetails :structure-id="structure.id || undefined" :show="true" :readonly="readonly"/>
          </v-window-item>

          <v-window-item value="users">
            <StructureUsers :structure-id="structure.id || undefined" :show="true" />
          </v-window-item>

          <v-window-item value="bank">
            <BankAccount :structure-id="structure.id || undefined" :show="true" :readonly="readonly"/>
          </v-window-item>

          <v-window-item value="contacts">
            <StructureContacts :structure-id="structure.id || undefined" :show="true" :readonly="readonly"/>
          </v-window-item>

          <v-window-item value="password">
            <PasswordModify />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
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
import StructureDetails from '@/components/account/StructureDetails.vue'
import DataTable from '@/components/common/DataTable.vue'
import FullDialog from '@/components/common/FullDialog.vue'
import PageDescription from '@/components/common/PageDescription.vue'
import ConfirmDialog from '@/components/dialog/ConfirmDialog.vue'
import RegistrationForm from '@/components/registration/RegistrationForm.vue'
import BankAccount from '@/components/structure-registry/BankAccount.vue'
import StructureContacts from '@/components/structure-registry/StructureContacts.vue'
import StructureUsers from '@/components/structure-registry/StructureUsers.vue'
import StructureStatusEnum from '@/enums/StructureStatusEnum'
import { useUsersStore } from '@/stores/users';
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { inject, reactive, ref, computed, type Ref } from 'vue'

const $axios = inject(axiosInjectKey)

// Stores
const usersStore = useUsersStore()

// Computed
const readonly = computed(() => {
  return !usersStore.isFondo
})

const cols = reactive([
  { key: 'code' },
  { key: 'business_name' },
  { key: 'fiscal_code' },
  { key: 'city' },
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

const tabs = reactive({ value: 'user' })

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

  await $axios?.put(`/registration-request/${structure.id}/status`, { status })
    .then(() => {})
    .catch(console.error)

  refTable.value?.loadData()

  closeDialog()

  toggleLoading()
}

</script>
