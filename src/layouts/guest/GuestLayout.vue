<template>
  <v-app class="app-container">
    <v-row class="h-100vh ma-0">
      <v-col
        cols="12"
        md="6"
        class="bg-koperniko-primary d-none d-md-flex align-center justify-center"
      >
        <h1 data-test="login-title" class="text-h4 text-white font-weight-medium">
          {{ $t('appName') }}
        </h1>
      </v-col>

      <v-col cols="12" md="6" class="d-flex align-center justify-center pa-0">
        <div class="left-container flex-fill pa-5">
          <RouterView />
        </div>
      </v-col>
    </v-row>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}
.left-container {
  max-height: 100vh;
  overflow: auto;
}
</style>
