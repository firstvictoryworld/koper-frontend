<template>
  <v-autocomplete
    v-model="input.model"
    v-model:search="input.search"
    :items="input.items"
    :loading="isLoading"
    :item-title="item => getItemTitle(item)"
    :item-value="item => (item.id || undefined)"
    :label="$t('autocomplete.doctor')"
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
import { useUsersStore } from '@/stores/users'

interface Props {
  value: any | any[]
  returnObject?: boolean
  binds?: Record<string, any>
  lendingId?: undefined | number | null
  specializationId?:  undefined | number | null
  structureId?:  undefined | number | null
  bookingId?: undefined | number | null
}

const usersStore = useUsersStore()

const props = withDefaults(defineProps<Props>(), {
  returnObject: false
})

const input = reactive({
  model: undefined as any,
  items: [],
  search: '',
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

const unwatchSpecialization = watch(() => props.specializationId, (specialization) => {
  input.model = props.value
  loadData()
})

// Functions

const getItemTitle = (item: Record<string, any>) => {
  return item ? `${item.surname} | ${item.name}` : undefined
}



const loadData = debounce(async (selected: any = null) => {
  toggleLoading()

  const url = `/doctors`

  await $axios?.get(url, {
    params: {
      selected,
      options: true,
      search: input.search,
      specializations: props.specializationId,
      structure_data_id: props.structureId,
      booking_id: props.bookingId
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
  unwatchSelected()
})

onBeforeUnmount(() => {
  unwatchSearch()
  unwatchModel()
  unwatchSelected()
})
</script>
