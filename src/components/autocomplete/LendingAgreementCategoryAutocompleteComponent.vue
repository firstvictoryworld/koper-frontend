<template>
  <v-autocomplete
    v-model="input.model"
    v-model:search="input.search"
    :items="input.items"
    :loading="isLoading"
    :item-title="item => getItemTitle(item)"
    :item-value="item => (item.id || undefined)"
    :label="$t('autocomplete.categories')"
    :placeholder="$t('autocomplete.placeholder')"
    persistent-placeholder
    prepend-inner-icon="mdi-database-search"
    :return-object="true"
    variant="outlined"
    hide-details="auto"
    v-bind="binds"
    clearable
  />
</template>

<script setup lang="ts">
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { debounce } from 'lodash'
import { inject, onBeforeUnmount, onMounted, reactive, watch } from 'vue'

interface Props {
  value: any | any[]
  returnObject?: boolean
  binds?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  returnObject: false
})

const input = reactive({
  model: undefined as any,
  items: [],
  search: '',
  parent_id: undefined as any,
  category: undefined as any,
})

// Events
const emit = defineEmits(['update:value'])

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

const $axios = inject(axiosInjectKey)

// Watcher
const unwatchSearch = watch(() => input.search, (value) => {
  if (!value || value === getItemTitle(input.model)) { return }
  loadData()
})

const unwatchModel = watch(() => input.model, (data) => {
  emit('update:value', props.returnObject ? data : (data as Record<string, any>).id)
})

const unwatchSelected = watch(() => props.value, (selectedValue) => {
  if(selectedValue) {
    if (props.returnObject && selectedValue.id === input.model.id) { return }
    if (!props.returnObject && selectedValue === input.model.id) { return }
  }
  loadData(selectedValue)
})

// Functions

const getItemTitle = (item: Record<string, any>) => {
  return item ? `${item?.code} | ${item?.name}` : undefined
}

const loadData = debounce(async (selected: any = null) => {
  toggleLoading()

  await $axios?.get('/lending-agreements', {
    params: {
      selected,
      options: true,
      search: input.search,
      parent_id: 'root',
    }
  })
    .then(({ data }) => {
      input.items = data
      if (!!selected && data.length) {
        input.model = data[0]
      }
    })
    .catch(console.error)

  toggleLoading()
}, 200)

onMounted(() => {
  loadData(props.value || null)
})

onBeforeUnmount(() => {
  unwatchSearch()
  unwatchModel()
  unwatchSelected()
})
</script>
