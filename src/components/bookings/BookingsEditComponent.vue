<template>
  <v-container>
    <BookingsSearchComponent 
      v-if="!data.id"
      @created="(booking: Record<string, any>) => created(booking.id)"
    />

    <BookingsShowComponent v-else :booking-id="data.id" @updated="() => updated()" @close="() => close()"  />
  </v-container>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import BookingsSearchComponent from './BookingsSearchComponent.vue'
import BookingsShowComponent from './BookingsShowComponent.vue'

const emit = defineEmits(['updated', 'close'])

const props = defineProps<{
  bookingId?: null | number
}>()

const data = reactive({
  id: props.bookingId || null,
})

// Functions
const created = (id: number) => {
  data.id = id
  updated()
}

const updated = () => {
  emit('updated')
}


const close = () => {
  emit('close')
}
</script>
