<template>
  <v-card class="card" :color="color" :variant="variant" :elevation="elevation">
    <v-card-item v-if="title || !!$slots.title">
      <v-card-title>
        <div class="d-flex align-center">
          <slot name="title">{{ title }}</slot>
          <v-spacer class="ml-3" />
          <v-btn icon variant="plain" density="comfortable" @click="() => toggleVisibility()">
            <v-icon>{{ isVisible ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>

      <v-divider v-show="isVisible" class="mt-2" :class="{
        'mb-3': !noPadding
      }" />
    </v-card-item>

    <v-card-text v-if="renderIfClosed || isVisible" v-show="isVisible" :class="{
      'pa-0': noPadding
    }">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useToggle } from '@vueuse/shared';

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  color?: string
  variant?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain" | undefined
  elevation?: number | string
  startOpened?: boolean
  renderIfClosed?: boolean
  noPadding?: boolean
}>(), {
  startOpened: true,
  renderIfClosed: true,
  noPadding: false
})

const [isVisible, toggleVisibility] = useToggle(props.startOpened)
</script>

<style lang="scss" scoped>
::v-deep .v-expansion-panel__shadow {
  box-shadow: none;
}
::v-deep .v-expansion-panel-text__wrapper {
  margin: 0;
  padding: 0;
}
.card {
  border-color: #ccc;
}
</style>