<template>
  <v-card :loading="isLoading" elevation="0">
    <v-card-item>
      <v-card-title class="d-flex align-center">
        <slot name="header">
          <div v-if="title">{{ title }}</div>
        </slot>

        <v-spacer/>

        <div v-if="!noSearchable" class="d-flex align-center justify-end pt-1 w-100" style="max-width:300px">
          <v-text-field v-model="table.search" :label="$t('search')" prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" hide-details class="w-100" />

          <v-btn variant="plain" color="koperniko-primary" class="ml-1" min-width="0" width="40" @click="loadData">
            <v-icon :title="$t('reload')">mdi-reload</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>

      <v-divider v-if="!noSearchable" class="mt-2 mb-3" />
    </v-card-item>

    <v-card-text>
      <v-table>

        <thead>
          <tr>
            <th v-for="(col) of cols" :key="`th-${col.key}`" :class="col.class" v-bind="col.colProps">
              {{ col.label !== undefined ? col.label : $t(`${localPrefix}${col.key}`) }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, i) of table.rows" :key="`row-${i}`">
            <td v-for="(col, j) of cols" :key="`td-${i}-${j}`" :style="{ width: !!col.actions ? '10px' : undefined }">

              <div v-if="!!col.actions" class="d-flex justify-center align-center">
                <v-btn v-for="(btn, k) of col.actions" :key="`${i}-${j}-${k}`" v-bind="btn.btnProps"
                  icon
                  :color="btn.color || 'koperniko-primary'"
                  density="comfortable"
                  @click="() => btn.handler(row)">
                  <v-icon size="17">{{ btn.icon }}</v-icon> 
                </v-btn>
              </div>

              <!-- Per customizzare i valori nelle celle usare lo slot: <template #col-id="{ row }"> ... </template> -->
              <slot v-else :name="`col-${col.key}`" :row="row">
                {{ row[col.key] || '' }}
              </slot>
           
            </td>
          </tr>
        </tbody>

      </v-table>
      <div v-if="totalTitle " class="mt-5" style = "text-align: right; padding: 0px 50px;">
        <b class="mr-5 mt-5">{{ totalTitle }}</b> <b>€ {{table.totalCost}} </b>
      </div>

      <div v-if="totalFundCostTitle" style = "text-align: right; padding: 0px 50px;">
        <b class="mr-5 mt-5">{{ totalFundCostTitle }}</b> <b>€ {{table.totalFundCost}} </b>
      </div>

      <div v-if="totalStructureCostTitle" style = "text-align: right; padding: 0px 50px;">
        <b class="mr-5 mt-5">{{ totalStructureCostTitle }}</b> <b>€ {{table.totalStructureCost}} </b>
      </div>
      
      <div v-if="totalPatientCostTitle" style = "text-align: right; padding: 0px 50px;">
        <b class="mr-5 mt-5">{{ totalPatientCostTitle }}</b> <b>€ {{table.totalPatientCost}} </b>
      </div>
     
      <div v-if="showPagination" class="text-center mt-5">
        <v-pagination v-model="table.page" density="comfortable" :length="table.lastPage" :total-visible="5" />
      </div>

      <v-overlay v-bind:model-value="isLoading" :persistent="true" contained></v-overlay>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { DatatableRowInterface, DatatableColInterface } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { debounce } from 'lodash'
import { computed, inject, onBeforeUnmount, onMounted, reactive, watch } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  cols: DatatableColInterface[]
  url: string
  localPrefix?: string
  order?: string
  direction?: string
  perPage?: number | 'infinite'
  totalCost?: number | 0
  totalTitle?: undefined | string 
  noSearchable?: undefined | boolean
  totalFundCostTitle?: undefined | string 
  totalStructureCostTitle?: undefined | string 
  totalPatientCostTitle?: undefined | string 

}

const props = withDefaults(defineProps<Props>(), {
  localPrefix: 'table.',
  perPage: 15
})

const $axios = inject(axiosInjectKey)

const table = reactive({
  page: 1,
  perPage: props.perPage === 'infinite' ? Math.pow(10, 10) : props.perPage,
  total: 0,
  lastPage: 1,
  rows: [] as DatatableRowInterface[],
  search: '',
  totalCost: 0,
  totalFundCost: 0,
  totalStructureCost: 0,
  totalPatientCost: 0,
})

// VueUse composables

const [isLoading, toggleLoading] = useToggle()

// Watchers
const unwatchSearch = watch(() => table.search, debounce(() => { loadData() }, 600))
const unwatchPage = watch(() => table.page, () => { loadData() })

// Computed
const showPagination = computed(() => props.perPage !== 'infinite')

// Functions

const loadData = debounce(async () => {

  if (!props.url) { return }

  toggleLoading()

  await $axios?.get(props.url, {
    params: {
      search: table.search,
      page: table.page,
      per_page: table.perPage,
      order: props.order || '', // TODO make order customizable
      direction: props.direction || '', // TODO make direction customizable
    }
  })
    .then(({ data }) => {
      const { data: rows, total, last_page, total_cost, tot_fund, tot_structure, tot_patient } = data
      table.rows = rows || []
      table.total = total || 0
      table.lastPage = last_page || 1
      table.totalCost = total_cost || 0
      table.totalFundCost = tot_fund || 0
      table.totalStructureCost = tot_structure || 0
      table.totalPatientCost = tot_patient || 0
    })
    .catch(console.error)

  toggleLoading()
}, 150)

defineExpose({ loadData })

onMounted(() => {
  loadData()
})

onBeforeUnmount(() => {
  unwatchSearch && unwatchSearch()
  unwatchPage && unwatchPage()
})


</script>
