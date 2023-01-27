<template>
  <RegistrationForm :structure-id="usersStore.userDetails.structureId || undefined" :readonly="true" />
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users';
import RegistrationForm from '../registration/RegistrationForm.vue'

// Stores
const usersStore = useUsersStore()
</script>
