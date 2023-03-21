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
      <template #subheader v-if="isCompleted">
        <v-row class="align-center w-100 ml-3">
          <v-col cols="6">
            <v-checkbox
              v-model.value="fields.recovery.value"
              type="checkbox"
              :true-value="1"
              :false-value="0"
              :label="$t(`doctors.edit.recovery`)"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="6">
            <v-checkbox
              v-model.value="fields.interventions.value"
              type="checkbox"
              :true-value="1"
              :false-value="0"
              :label="$t(`doctors.edit.interventions`)"
              hide-details="auto"
            />
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
    <DataTable ref="refShowTable" :title="$t(`doctors.lending.title`)" :cols="colsShow" :url="`/doctors/${doctorId}/lendings`" local-prefix="doctors.lending." class="mt-5">

    <template #col-specialization="{ row }">
      {{ row.doctors[0].specializations[0].name }}
    </template>

    <template #col-recovery="{ row }">
      <v-checkbox
        v-model="row.recovery"
        :true-value="1"
        false-value="0"
        hide-details="auto"
        disabled
      />
    </template>

    <template #col-interventions="{ row }">
      <v-checkbox
        v-model="row.interventions"
        :true-value="1"
        :false-value="0"
        hide-details="auto"
        disabled
      />
    </template>

    </DataTable>

</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import specializations from '@/locales/it-IT/specializations'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { values } from 'lodash'
import { computed, inject, reactive, ref, type Ref } from 'vue'
import SpecializationAutocompleteComponent from '../autocomplete/SpecializationAutocompleteComponent.vue'
import DataTable from '../common/DataTable.vue'

const props = defineProps<{
  doctorId: null | string | number
  structureId:  undefined|null|number
}>()

const $axios = inject(axiosInjectKey)

const fields = reactive({
  specialization: { value: null},
  cost: { value: '' },
  recovery: { value: 0 },
  interventions: { value: 0},
})

const cols = reactive([
  { key: 'id' },
  { key: 'code' },
  { key: 'name' },
  { key: 'cost' },

  { label: '', key: '', actions:
    [
      { icon: 'mdi-content-save', color: 'koperniko-primary', handler(row) { save(row) } }
    ]
  },
] as DatatableColInterface[])

const colsShow = reactive([
  { key: 'code' },
  { key: 'lending_name' },
  { key: 'specialization_name' },
  { key: 'recovery' },
  { key: 'interventions' },
  { key: 'cost' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-delete', handler(row) { remove(row) }, color: 'red' },
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
    cost: row.cost ? row.cost : null,
    specialization: fields.specialization.value,
    recovery: fields.recovery.value ? fields.recovery.value : 0,
    interventions: fields.interventions.value ? fields.interventions.value : 0,
    structure_data_id: props.structureId
  })
    .then(() => {
      refShowTable.value?.loadData()
    })
    .catch(console.error)

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
  const data = {  specialization: row?.specialization_id}

  await $axios?.delete(`/doctors/${props.doctorId}/lendings/${row.id}/`, 
  { data: { specialization: row?.specialization_id }, headers: { "Authorization": "***" } })
  
    .then(() => {
      refShowTable.value?.loadData()
    })
    .catch(console.error)

  toggleLoading()
}
</script>
