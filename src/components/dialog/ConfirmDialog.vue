<template>
  <v-dialog
    :model-value="show"
    persistent
  >
    <v-card variant="elevated" min-width="280" max-width="480" class="mx-auto">
      <v-card-title class="text-h6 text-white bg-yellow-darken-3">
        {{ title || $t('confirmRequired') }}
      </v-card-title>

      <v-card-text class="bg-white">{{ message || $t('confirmMessage') }}</v-card-text>

      <v-card-actions class="bg-white justify-end">
        <v-btn
          color="grey-darken-3"
          variant="plain"
          class="mr-3"
          @click="() => cancelHandler()"
        >
          {{ $t('cancel') }}
        </v-btn>

        <v-btn
          color="yellow-darken-4"
          variant="flat"
          @click="() => confirmHandler()"
        >
          {{ $t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  title?: string
  message?: string
}

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  message: ''
})

// Functions

const cancelHandler = (() => {
  emit('cancel')
  emit('update:show', false)
})

const confirmHandler = (() => {
  emit('confirm')
  emit('update:show', false)
})
</script>
