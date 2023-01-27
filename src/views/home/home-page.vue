<template>
  <v-container>
    <PageDescription
      :title="$t('home.title')"
      :subtitle="subtitle"
    />

    <AdminPage v-if="usersStore.isAdmin" />
    
    <StrutturaPage v-else />
  </v-container>
</template>

<script setup lang="ts">
import AdminPage from './admin-page.vue'
import StrutturaPage from './struttura-page.vue'
import { useUsersStore } from '@/stores/users'
import PageDescription from '@/components/common/PageDescription.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Stores
const usersStore = useUsersStore()
const i18n = useI18n()

// Computed
const subtitle = computed(() =>
  i18n.t('home.subtitle')
    .replace(':name', usersStore?.userDetails?.name || '')
    .replace(':surname', usersStore?.userDetails?.surname || '')
)

</script>
