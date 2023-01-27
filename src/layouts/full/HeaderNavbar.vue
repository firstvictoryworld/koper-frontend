<template>
  <v-app-bar
    class="d-flex justify-center align-center"
    elevation="0"
    :color="headerColor"
  >
    <v-app-bar-nav-icon
      color="white"
      class="hidden-sm-and-down"
      @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
    />

    <v-app-bar-nav-icon
      color="white"
      class="hidden-md-and-up"
      @click.stop="customizer.SET_SIDEBAR_DRAWER"
    />

    <v-spacer />

    <!-- ---------------------------------------------- -->
    <!--- right part -->
    <!-- ---------------------------------------------- -->

    <v-menu anchor="bottom end" origin="auto">
      <template #activator="{ props }">
        <v-btn v-bind="props" color="white" size="x-large" variant="tonal" density="compact" icon="mdi-account">
        </v-btn>
      </template>

      <v-list class="pa-5 mt-2" elevation="10" rounded="lg" max-width="300">
        <p class="mx-5">{{ usersStore.role }}</p>
        <v-list-item
          v-for="(item, i) of topMenu"
          :key="i"
          rounded="lg"
          class="mb-1"
          @click.stop="handleClick(item)"
        >
          <template #prepend>
            <v-btn
              class="ma-2"
              color="indigo"
              icon
              density="compact"
            >
              <v-icon size="17">{{ item.icon }}</v-icon>
            </v-btn>
          </template>
          <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useCustomizerStore } from '../../stores/customizer'
import { useUsersStore } from '@/stores/users'
import { topMenu } from './menu'
import router from '@/router';
import { axiosInjectKey } from '@/utils/axios';

const $axios = inject(axiosInjectKey)

// <-- Stores -->
const customizer = useCustomizerStore()
const usersStore = useUsersStore()

const headerColor = computed(() => {
  return usersStore.isAdmin ? 'koperniko-primary' : 'koperniko-purple'
})

// <-- Functions -->
const handleClick = async (item: any) => {
  if (item.logout) {
    await $axios?.post('/logout')
    usersStore.logout()
    return router.push({ name: 'login' })
  }
  return router.push(item.to)
}
</script>
