<template>
  

    <DataTable ref="refTable" :cols="cols" url="/registration-request" local-prefix="structures.registrations." class="mt-5">
      <template #col-valid_from="{ row }">
        {{ row.deed_of_agreements[0]?.valid_from }}
      </template>

      <template #col-valid_to="{ row }">
        {{ row.deed_of_agreements[0]?.valid_to }}
      </template>

      <template #col-closed="{ row }">
        <v-checkbox hide-details="auto" color="koperniko-secondary"
          variant="outlined" :true-value="3" :false-value="0" density="compact" 
          :disabled="row.status === StructureStatusEnum.CLOSED" v-model="row.status"
        />
      </template>
    </DataTable>

    <FullDialog
    :show="structure.id !== undefined"
    @close="() => structure.id = undefined"
  >
    <template #title>{{ $t('agreementDeed.edit.title') }}</template>
      
    <v-card>
    <template #title>
      {{ $t('agreementDeed.edit.subtitle') }} {{ structure.code }} - {{ structure.business_name }}
    </template>
    <v-divider class="my-5" />
    <v-card-text class="bg-white">

   
      <p class="mb-5">La seguente azione comporterà:</p>
      <ol class="ml-5">
        <li>Chiusura della Negoziazione</li>
        <li>Disattivazione della possibilità di creare nuove Prenotazioni</li>
        <li>Disattivazioni di tutti gli Utenti della Struttura</li>
      </ol>
      <p class="mt-5">Si è sicuri di voler continuare?</p>
    </v-card-text>

        <v-divider class="my-5" />
       
        <v-card-actions class="bg-white justify-end">
        <v-btn
          color="grey-darken-3"
          variant="plain"
          class="mr-3"
          @click="() => structure.id = undefined"
        >
          {{ $t('cancel') }}
        </v-btn>

        <v-btn
          color="yellow-darken-4"
          variant="flat"
          @click="save"
        >
          {{ $t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
   

  </FullDialog>


  
</template>

<script setup lang="ts">
// FIXME clean and move to separated components
import type { DatatableColInterface, DatatableRowInterface, DatatableComponent } from '@/@types'
import DataTable from '@/components/common/DataTable.vue'
import FullDialog from '../common/FullDialog.vue'
import StructureStatusEnum from '@/enums/StructureStatusEnum'
import { useUsersStore } from '@/stores/users';
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { inject, reactive, ref, computed, type Ref } from 'vue'
import CardContainer from '../common/CardContainer.vue'

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
  { key: 'valid_from' },
  { key: 'valid_to' },
  { key: 'closed' },
  { label: '', key: '', actions:
    [
    { icon: 'mdi-content-save', color: 'koperniko-primary', handler(row) { show(row) } }
    ]
  },
] as DatatableColInterface[])

const tabs = reactive({ value: 'user' })

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)
const status = reactive({
  closed: 3,
  
})

const structure = reactive({
  id: undefined as undefined|null|number,
  code: undefined as undefined|null|string,
  business_name: undefined as undefined|null|string,
  status: undefined as undefined|null|number
})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Functions

const show = (row: Record<string, any>) => {

  structure.id = row.id || null
  structure.code = row.code || null
  structure.business_name = row.business_name || null
  structure.status = row.status || null

}

const save = async () => {
  toggleLoading()
  await $axios?.put(`/registration-request/${structure.id}/status`, {
   
    status: structure.status
  })
    .then(() => {
      refTable.value?.loadData()
      structure.id = undefined
    })
    .catch(console.error)

  toggleLoading()
}

</script>
