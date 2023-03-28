<template>
  <v-navigation-drawer
    v-model="customizer.Sidebar_drawer"
    left
    :permanent="$vuetify.display.mdAndUp"
    elevation="10"
    :class="customizer.SidebarColor === 'white' ? '' : 'text-white'"
    :color="customizer.darktheme ? '' : customizer.SidebarColor"
    rail-width="77"
    mobile-breakpoint="960"
    app
    :rail="customizer.mini_sidebar"
    expand-on-hover
  >
    <!-- ---------------------------------------------- -->
    <!--- Logo part -->
    <!-- ---------------------------------------------- -->
    <div class="pa-4">
      <v-icon size="x-large" color="koperniko-primary">
        mdi-alpha-k-box
      </v-icon>
    </div>

    <!-- ---------------------------------------------- -->
    <!--- Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4" color="transparent">
        <!-- ---------------------------------------------- -->
        <!--- Menu Loop -->
        <!-- ---------------------------------------------- -->
        <template v-for="(item, i) of mainMenu">

          <!-- ---------------------------------------------- -->
          <!--- Item Sub Header -->
          <!-- ---------------------------------------------- -->
          <v-list-subheader v-if="item.header && (item.allowedTypes?.includes(usersStore?.userDetails?.type || 0) || usersStore?.userDetails?.accesses?.includes(item.allowedAccesses))" :key="i">
            {{ item.header }}
           
          </v-list-subheader>

          <!-- ---------------------------------------------- -->
          <!--- Single Item -->
          <!-- ---------------------------------------------- -->
          <template v-else>
            <v-list-item
              v-if="item.allowedTypes?.includes(usersStore?.userDetails?.type || 0) || usersStore?.userDetails?.accesses?.includes(item.allowedAccesses)"
              :active="route.fullPath === item.to"
              :key="i"
              :disabled="!item.alwaysActive && (item.disabled === true || (!usersStore?.structureCompleted && !usersStore?.structureClosed) || false)"
              :to="item.to"
              rounded="lg"
              class="mb-1"
            >
           
           
              <template #prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ $t(item.title || '') }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- ---------------------------------------------- -->
          <!--- End Single Item -->
          <!-- ---------------------------------------------- -->
        </template>
      </v-list>
    </perfect-scrollbar>

  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useCustomizerStore } from '@/stores/customizer'
import { useUsersStore } from '@/stores/users'
import { useRoute } from 'vue-router';
import { mainMenu } from './menu'

// <-- Stores -->
const customizer = useCustomizerStore()
const usersStore = useUsersStore()
const route = useRoute()
</script>
