<template>
  <DataTable ref="refTable" :cols="cols" url="/agreements" local-prefix="agreements.list." class="mt-5">
    <template #header>
      <v-btn v-if="!readonly" class="ml-3" variant="flat" color="koperniko-primary" @click="() => agreement.id = null">
        {{ $t('add') }} 
      </v-btn>
    </template>

    <template #col-structure="{ row }">
      {{ row.structure_data.business_name }}
    </template>

    <template #col-status="{ row }">
      <v-icon v-if="AgreementStatusEnum.ACTIVE === row.status" color="green">mdi-check</v-icon>
      <v-icon v-else-if="AgreementStatusEnum.REJECTED === row.status" color="red">mdi-cancel</v-icon>
      <v-icon v-else color="yellow-darken-3">mdi-timer-sand-complete</v-icon>
    </template>

    <template #col-active="{ row }">
      <v-icon v-if="row.active" color="green">mdi-check</v-icon>
      <v-icon v-else color="red">mdi-cancel</v-icon>
    </template>
  </DataTable>

  <FullDialog
    :show="agreement.id !== undefined"
    @close="() => agreement.id = undefined"
  >
    <template #title>{{ $t('agreements.edit.title') }}</template>

    <template #toolbar>
      <div id="agreement-toolbar-target" class="d-flex justify-center align-center"></div>
    </template>

    <AgreementsEditComponent v-if="agreement.id !== undefined" :agreement-id="agreement.id" @updated="() => reload()" />
  </FullDialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import AgreementStatusEnum from '@/enums/AgreementStatusEnum'
import { useUsersStore } from '@/stores/users'
import { computed, reactive, ref, type Ref } from 'vue'
import DataTable from '../common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import AgreementsEditComponent from './AgreementsEditComponent.vue'

const usersStore = useUsersStore()

const cols = reactive([
  { key: 'id' },
  { key: 'structure', },
  { key: 'lending_agreements_count', },
  { key: 'valid_from', },
  { key: 'valid_to', },
  { key: 'subscribed_at' },
  { key: 'status', },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-pencil', handler(row) { show(row) } }
    ]
  },
] as DatatableColInterface[])

const agreement = reactive({
  id: undefined as undefined|null|number
})

// Computed
const readonly = computed(() => {
  return !usersStore.isStruttura
})

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const show = (row: Record<string, any>) => {
  agreement.id = row.id || null
}

const reload = () => {
  refTable.value?.loadData()
}

</script>
