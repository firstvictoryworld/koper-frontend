<template>
  <FirstAccessForm v-if="usersStore.structureNotCompleted" />
  <div v-else><!-- TODO --></div>
</template>

<script setup lang="ts">
import FirstAccessForm from '@/components/registration/FirstAccessForm.vue'
import { useUsersStore } from '@/stores/users';

const usersStore = useUsersStore()

</script>
