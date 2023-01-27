<template>
  <div class="mb-5">
    <h1 class="text-h4">{{ props.title }}</h1>
    <h2 class="text-subtitle-1">{{ props.subtitle }}</h2>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
}>()
</script>
