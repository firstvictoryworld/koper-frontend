<template>
  <v-card density="compact">
    <v-card-text class="d-flex justify-end">
      <v-btn variant="plain" color="koperniko-primary" class="mr-3" @click="loadData">
        <v-icon class="mr-1">mdi-reload</v-icon>
        {{ $t('reload') }} 
      </v-btn>
    </v-card-text>
  </v-card>

  <LendingComponent
    v-for="(lending, i) in lendings.list"
    :key="`lending-cat-${i}`"
    :indexes="[i]"
    :readonly="readonly"
    v-bind:data="lendings.list[i]"
  />

  <v-btn
    v-if="!readonly"
    variant="flat"
    color="koperniko-primary"
    class="mt-5 mx-auto d-block"
    v-t="'lending.addGroupLending'"
    @click="() => add()"
  />

  <v-overlay v-bind:model-value="isLoading" :persistent="true" contained></v-overlay>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { computed, inject, onMounted, reactive } from 'vue'
import LendingComponent, { type LendingInterface } from './LendingComponent.vue'
import { addLending, provideLendingsListObject, setupList } from './lendingLogic'

const $axios = inject(axiosInjectKey)
const lendings = reactive({ list: [] as LendingInterface[] })
const usersStore = useUsersStore()

provideLendingsListObject(lendings)

const readonly = computed(() => !usersStore.isAdmin)

// Togglers
const [isLoading, toggleLoading] = useToggle()

// Functions
const loadData = async () => {
  toggleLoading()

  await $axios?.get('/lendings', {
    params: {
      parent_id: 'root'
    }
  })
    .then(({ data }) => {
      lendings.list = setupList(data.lendings)
    })
    .catch(console.error)

  toggleLoading()
}

const add = () => {
  addLending(lendings, [lendings.list.length - 1], true)
}

onMounted(() => {
  loadData()
})
</script>
