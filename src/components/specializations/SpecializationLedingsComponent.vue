<template>
    <DataTable ref="refTable" :cols="cols" :url="`specializations/${specializationId}/lendings`" local-prefix="lendings.list." class="mt-5">

      <template #header>
        <v-row class="align-center pt-1">
          <v-col cols="12" :md="true">
            <LendingAutocompleteComponent v-model:value="fields.leading.value" :not-specialization="specializationId" />
          </v-col>
          <v-col cols="12" md="auto">
            <v-btn :disabled="!isCompleted" size="large" color="koperniko-primary" :loading="isLoading" @click.prevent="add">
              {{ $t('add') }}
            </v-btn>
          </v-col>
        </v-row>
      </template>

    </DataTable>
</template>

<script setup lang="ts">
import type { DatatableColInterface, DatatableComponent } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { computed, inject, reactive, ref, type Ref } from 'vue'
import LendingAutocompleteComponent from '../autocomplete/LedingAutocompleteComponent.vue'
import DataTable from '../common/DataTable.vue'

const props = defineProps<{
  specializationId: null | string | number
}>()

const $axios = inject(axiosInjectKey)

const fields = reactive({
  leading: { value: null },
})

const cols = reactive([
  { key: 'id' },
  { key: 'code' },
  { key: 'name' },
  { label: '', key: '', actions:
    [
      { icon: 'mdi-delete', color: 'red', handler(row) { remove(row) } }
    ]
  },
] as DatatableColInterface[])

// Computed
const isCompleted = computed(() => !!fields.leading.value)

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)

// Functions

const add = async () => {
  if (!isCompleted.value) { return }

  toggleLoading()

  await $axios?.put(`/specializations/${props.specializationId}/lendings/${fields.leading.value}`)
    .then(() => {
      refTable.value?.loadData()
    })
    .catch(console.error)

  fields.leading.value = null

  toggleLoading()
}

const remove = async (row: Record<string, any>) => {
  if (!row.id) { return }

  // TODO confirm operation

  toggleLoading()

  await $axios?.delete(`/specializations/${props.specializationId}/lendings/${row.id}`)
    .then(() => {
      refTable.value?.loadData()
    })
    .catch(console.error)

  toggleLoading()
}
</script>
