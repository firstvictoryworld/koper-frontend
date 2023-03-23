<template>
  <v-card :loading="isLoading" elevation="0">
    <v-card-item>
      <v-card-title class="d-flex align-center">
        <slot name="header">
          <div v-if="title">{{ title }}</div>
        </slot>

        <v-spacer/>

        <div class="d-flex align-center justify-end pt-1 w-100" style="max-width:300px">
          <v-text-field v-show="!noSearchable" v-model="table.search" :label="$t('search')" prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" hide-details class="w-100" />

          <v-btn variant="plain" color="koperniko-primary" class="ml-1" min-width="0" width="40" @click="loadData">
            <v-icon :title="$t('reload')">mdi-reload</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>

      <v-divider class="mt-2 mb-3" />
    </v-card-item>

    <v-spacer/>

    <slot name="subheader">
    </slot>

    <v-spacer/>
    
    <v-card-text>
      <v-table>

        <thead>
          <tr>
            <DataTableHead v-for="(col) of cols" :col="col" :localPrefix="localPrefix" @filterApply="onFilterApply">
				<template v-if="col.enableSelectAll" #col-checkbox>
					<v-checkbox  hide-details="auto" color="koperniko-secondary"
						variant="outlined"  density="compact" v-model="selectAll"/>
				</template>
			</DataTableHead>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, i) of table.rows" :key="`row-${i}`">
            <td v-for="(col, j) of cols" :key="`td-${i}-${j}`" :style="{ width: !!col.actions ? '10px' : undefined }">

              <div v-if="!!col.actions" class="d-flex justify-center align-center">
                <v-btn v-for="(btn, k) of col.actions" :key="`${i}-${j}-${k}`"
                  icon
                  :color="btn.color || 'koperniko-primary'"
                  density="comfortable"
                  v-bind="btn.btnProps"
                  v-show="!!btn.show ? btn.show(row) : true"
                  :disabled="typeof btn.btnProps?.disabled === 'function' ? btn.btnProps.disabled(row) : btn.btnProps?.disabled"
                  @click="() => btn.handler(row)">
                  <v-icon size="17">{{ btn.icon }}</v-icon> 
                </v-btn>
              </div>

              <!-- Per customizzare i valori nelle celle usare lo slot: <template #col-id="{ row }"> ... </template> -->
              <slot v-else :name="`col-${col.key}`" :row="row">
                {{ row[col.key] ?? '' }}
              </slot>
           
            </td>
          </tr>
        </tbody>

      </v-table>

      <slot name="totals"></slot>

      <div v-if="showPagination" class="text-center mt-5">
        <v-pagination v-model="table.page" density="comfortable" :length="table.lastPage" :total-visible="5" />
      </div>

      <v-overlay v-bind:model-value="isLoading" :persistent="true" contained></v-overlay>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { DatatableRowInterface, DatatableColInterface, DatatableStampInterface } from '@/@types'
import type { DatatableFilter } from '@/@types/dataTable'
import DataTableHead from '@/components/common/DataTableHead.vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { debounce } from 'lodash'
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect } from 'vue'

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
  queryParams?: undefined | Record<string, any>
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
  filters: [] as DatatableFilter[],
  totalCost: 0,
  stamp: [] as DatatableStampInterface[],
})

const emit = defineEmits(['loaded', 'selectAll']);

const selectAll = ref(false)

// VueUse composables

const [isLoading, toggleLoading] = useToggle()

// Watchers
const unwatchSearch = watch(() => table.search, debounce(() => { table.page = 1; loadData() }, 600))
const unwatchPage = watch(() => table.page, () => { loadData() })
const unwatchSelectAll = watchEffect(() => {
	emit('selectAll', selectAll.value)
})

// Computed
const showPagination = computed(() => props.perPage !== 'infinite')

// Functions

const resetSelectAll = () => {
	selectAll.value = false
}

const onFilterApply = (filter: DatatableFilter) => {
	let index = table.filters.findIndex(_f => _f.key == filter.key);
	if (index >= 0) {
		table.filters = [
			...table.filters.slice(0, index),
			filter,
			...table.filters.slice(index+1, table.filters.length)
		]
	} else {
		table.filters = [
			...table.filters,
			filter
		]
		
	}
	loadData()
}

const getFilterQueryParams = () => {
	let queryParams: any = {}
	if (table.filters && table.filters.length) {
		table.filters.forEach((filter) => {
			queryParams[filter.key] = filter.values;
		})
	}

	return queryParams
}

let controller: undefined | AbortController

const loadData = debounce(async () => {

  if (!props.url) { return }

  if (controller && isLoading) {
    controller.abort()
  }

  controller = new AbortController()

  toggleLoading()

  await $axios?.get(props.url, {
    signal: controller.signal,
    params: {
      search: table.search,
      page: table.page,
      per_page: table.perPage,
      order: props.order || '', // TODO make order customizable
      direction: props.direction || '', // TODO make direction customizable
      ...(props.queryParams || {}),
	  ...(getFilterQueryParams())
    }
  })
    .then(({ data }) => {
      const { data: rows, total, last_page, ...rest } = data
      table.rows = rows || []
      table.total = total || 0
      table.lastPage = last_page || 1

      emit('loaded', { ...table, ...rest })
    })
    .catch(console.error)

  toggleLoading()
}, 150)

defineExpose({ resetSelectAll, loadData })

onMounted(() => {
  loadData()
})

onBeforeUnmount(() => {
  unwatchSearch && unwatchSearch()
  unwatchPage && unwatchPage()
  unwatchSelectAll && unwatchSelectAll()
})

</script>
