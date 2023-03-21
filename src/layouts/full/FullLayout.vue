<template>
  <v-app
    :theme="customizer.darktheme ? 'dark' : 'light'"
    :class="[customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout']"
  >
    <VerticalSidebarVue />
    <VerticalHeaderVue />
    <v-main>
      <v-container fluid class="page-wrapper">
        <RouterView />
        
      </v-container>
      <p style="text-align:center; padding:5;">V.{{ version }}</p>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import VerticalSidebarVue from './LeftSidebar.vue'
import VerticalHeaderVue from './HeaderNavbar.vue'
import { useCustomizerStore } from '@/stores/customizer'


const customizer = useCustomizerStore()
const version = import.meta.env.VITE_APP_VERSION
</script>
