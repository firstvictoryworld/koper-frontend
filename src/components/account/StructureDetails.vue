<template>
  <RegistrationForm :structure-id="usersStore.userDetails.structureId || undefined" :readonly="readonly" />
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users';
import RegistrationForm from '../registration/RegistrationForm.vue'

// Stores
const usersStore = useUsersStore()

// Props
const props = defineProps<{
  readonly?: boolean
}>()
</script>
