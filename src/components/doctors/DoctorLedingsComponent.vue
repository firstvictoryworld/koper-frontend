<template>
    <DataTable ref="refTable" :cols="cols" :url="`specializations/${fields.specialization.value}/lendings`" local-prefix="lendings.list." class="mt-5">

      <template #header>
        <v-row class="align-center pt-1 w-100 mr-6">
          <v-col cols="12" :md="true">
            <SpecializationAutocompleteComponent v-model:value="fields.specialization.value" :not-doctor="doctorId" />
          </v-col>
        
          <v-col cols="12" md="auto">
            <v-btn size="large" :disabled="!isCompleted" color="koperniko-primary" :loading="isLoading" @click.prevent="show">
              {{ $t('add') }}
            </v-btn>
          </v-col>
        </v-row>
      </template>

      <template #col-cost="{ row }">
       
        <v-col cols="3" :md="true">
            <v-text-field
              v-model.number="row.cost"
              type="number"
              :label="$t(`doctors.lending.cost`)"
              variant="outlined"
              hide-details="auto"
              class="hide-arrows"
            />
          </v-col>
      </template>


    </DataTable>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { values } from 'lodash'
import { computed, inject, reactive, ref, type Ref } from 'vue'
import SpecializationAutocompleteComponent from '../autocomplete/SpecializationAutocompleteComponent.vue'
import DataTable from '../common/DataTable.vue'

const props = defineProps<{
  doctorId: null | string | number
}>()

const $axios = inject(axiosInjectKey)

const fields = reactive({
  specialization: { value: null},
  cost: { value: '' },
})

const cols = reactive([
  { key: 'id' },
  { key: 'code' },
  { key: 'name' },
  { key: 'cost' },

  { label: '', key: '', actions:
    [
      { icon: 'mdi-content-save', color: 'koperniko-primary', handler(row) { save(row) } },
    ]
  },
] as DatatableColInterface[])


// Computed
const isCompleted = computed(() => !!fields.specialization.value)

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)
const refShowTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const save = async (row: Record<string, any>) => {
 
  toggleLoading()
  await $axios?.put(`/doctors/${props.doctorId}/lendings/${row.id}`, {
    cost: row.cost,
    specialization: fields.specialization.value
  })
    .then(() => {
      // refTable.value?.loadData()
    })
    .catch(console.error)

  fields.specialization.value = null

  toggleLoading()
}

const show = async () => {
  if (!isCompleted.value) { return }

  refTable.value?.loadData()
  
  toggleLoading()
  toggleLoading()
}

const remove = async (row: Record<string, any>) => {
  if (!row.id) { return }

  // TODO confirm operation

  toggleLoading()

  await $axios?.delete(`/doctors/${props.doctorId}/lendings/${row.id}`)
    .then(() => {
      refShowTable.value?.loadData()
    })
    .catch(console.error)

  toggleLoading()
}
</script>
