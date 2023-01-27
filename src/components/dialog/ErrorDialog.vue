<template>
  <v-dialog
    :model-value="props.show"
    persistent
  >
    <v-card variant="elevated" min-width="280" max-width="480" class="mx-auto">
      <v-card-title class="text-h6 text-white bg-red-accent-2">
        {{ props.title }}
      </v-card-title>

      <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
      <v-card-text class="bg-white" v-html="props.message" />

      <v-card-actions class="bg-white">
        <v-btn
          color="koperniko-primary"
          variant="flat"
          @click="$emit('update:show', false)"
        >
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">

interface Props {
  show?: boolean
  title?: string
  message: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  message: ''
})
</script>
