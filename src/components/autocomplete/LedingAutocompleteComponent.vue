<template>
  <v-autocomplete
    v-model="input.model"
    v-model:search="input.search"
    :items="input.items"
    :loading="isLoading"
    :item-title="item => getItemTitle(item)"
    :item-value="item => (item.id || undefined)"
    :label="$t('lendings.autocomplete.label')"
    :placeholder="$t('autocomplete.placeholder')"
    persistent-placeholder
    prepend-inner-icon="mdi-database-search"
    :return-object="true"
    variant="outlined"
    hide-details="auto"
    clearable
  />
</template>

<script setup lang="ts">
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { debounce } from 'lodash'
import { inject, onBeforeUnmount, onMounted, reactive, watch } from 'vue'

interface Props {
  notSpecialization?: string | number | null
  value: any
}

const props = withDefaults(defineProps<Props>(), {})

const input = reactive({
  model: undefined as any,
  items: [],
  search: ''
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

const unwatchModel = watch(() => input.model, (structureData: Record<string, any>) => {
  emit('update:value', structureData.id)
})

const unwatchSelected = watch(() => props.value, (selectedValue) => {
  if (selectedValue === input.model.id) { return }
  loadData(selectedValue)
})

// Functions

const getItemTitle = (item: Record<string, any>) => {
  return item ? `${item.code} | ${item.name}` : undefined
}

const loadData = debounce(async (selected: any = null) => {
  toggleLoading()

  await $axios?.get('/lendings', {
    params: {
      not_specialization: props.notSpecialization,
      leaf: true,
      selected,
      options: true,
      search: input.search
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
