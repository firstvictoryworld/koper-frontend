<template>
  <RegistrationForm :structure-id="structureId || undefined" :readonly="readonly" />
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref, type GlobalComponents, type Ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users';
import RegistrationForm from '../registration/RegistrationForm.vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'


// Stores
const usersStore = useUsersStore()

const $axios = inject(axiosInjectKey)

// Props
const props = defineProps<{
  structureId?: number
  show?: boolean
}>()

const fields = reactive({
  mog: {
    mog: null
  },
})

// Computed
const readonly = computed(() => {
  return !usersStore.isFondo
})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

const loadData = async () => {
  if (!props.structureId) { return }

  toggleLoading()

  await $axios?.get(`/registration-request/${props.structureId}`)
    .then(({ data }) => {
      fields.mog.mog = data.mog

    })
    .catch(console.error)

  toggleLoading()
}

onMounted(() => {
  loadData()
})
</script>

