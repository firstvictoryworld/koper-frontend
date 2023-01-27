<template>
  <v-dialog
    v-bind:model-value="show"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <v-card :loading="loading" color="grey-lighten-4" class="custom-full-fialog">
      <v-toolbar
        dark
        color="koperniko-primary"
      >
        <v-toolbar-title>
          <slot name="title" />
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <slot name="toolbar" />

          <v-btn icon dark @click="$emit('close')" >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <div class="custom-full-fialog-container">
        <v-container>
          <slot />
        </v-container>   
      </div>
    </v-card>

    <v-overlay v-bind:model-value="loading" :persistent="true" contained></v-overlay>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  show: false,
  loading: false
})
</script>

<style lang="scss">
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform .2s ease-in-out;
}

.custom-full-fialog {
  height: 100vh;
}

.custom-full-fialog-container {
  overflow: auto;
}
</style>
