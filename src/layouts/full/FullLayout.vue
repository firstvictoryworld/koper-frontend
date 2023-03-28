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
        <div class="footer">
          <p>V.{{ version }}</p>
        </div>
      </v-container>
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

<style>
.footer {
  position:absolute; 
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding-bottom:5;
}
</style>

