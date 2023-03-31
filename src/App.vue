<template>
  <RouterView />
  <ErrorDialog
    v-model:show="axiosErrorDetails.show"
    v-model:title="axiosErrorDetails.title"
    v-model:message="axiosErrorDetails.message"
    max-width="650"
  />
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, provide, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from './stores/users'
import { axiosInjectKey } from './utils/axios'
import ErrorDialog from '@/components/dialog/ErrorDialog.vue'
import { chain, debounce, map } from 'lodash'
import type { LoginResponse } from './@types'
import { appReloadCurrentUserInjectionKey } from './utils/koperniko'
import { useTagTitle, useTagLink } from '@vueuse/head'

const router = useRouter()
const $axios = inject(axiosInjectKey)
const usersStore = useUsersStore()

const axiosErrorDetails = reactive({ show: false, title: '', message: '' })

useTagTitle('Koperniko')
useTagLink([
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
  { rel: 'manifest', href: '/site.webmanifest' }
])

// Setup axios

// TODO tradurre errori axios

let csrfMismatchCounter = 0 
$axios?.interceptors.response.use(response => response, async (error) => {
  const { status, data } = error.response || {}

  if (status === 419 && data.message?.includes('CSRF') && csrfMismatchCounter < 2) {
    csrfMismatchCounter += 1
    await new Promise(r => setTimeout(r, 300))
    await $axios?.get('/sanctum/csrf-cookie', {
      baseURL: import.meta.env.VITE_APP_BASE_URL
    })
    await new Promise(r => setTimeout(r, 300))
    return $axios?.request({
      ...error.config,
      headers: {
        ...error.config.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }

  csrfMismatchCounter = 0

  if (error.config.silent) {
    return Promise.reject(error)
  }

  if (status === 401 && usersStore.isLogged) {
    usersStore.logout()
    router.replace({ name: 'login' })
    return showError('Autenticazione scaduta, effettua nuovamente il login.')
  }

  if (status === 403) {
    showError(data?.message || 'Modifica non consentita')
  }

  else if (status === 422) {

    const message = chain(data.errors)
      .map((errors) => {
        return map(errors, (error) => {
          return `- ${error}`
        })
      })
      .flatten()
      .join('<br>')
      .value()

    showError(
      message || 'I dati inseriti non sono validi',
      'Dati non validi:'
    )
  }

  else if (/^4[0-9]{2}$/.test(status) || status >= 500) {
    showError(data?.message || data?.error || error.message)
  }

  return Promise.reject(error)
})

$axios?.interceptors.request.use((config) => {

  config.headers = {
    ...(config.headers || {}),
    'Accept': 'application/json'
  }

  if (usersStore.isLogged && config.baseURL?.includes(import.meta.env.VITE_APP_BASE_URL)) {
    Object.assign(config.headers, {'Authorization': usersStore.bearerToken})
  }

  return config
})

// Functions
const showError = (message: string, title: string = 'Attenzione') => {
  axiosErrorDetails.title = title
  axiosErrorDetails.message = message
  axiosErrorDetails.show = true
}

const reloadCurrentUser = debounce(async () => {
  if (!usersStore.isLogged || usersStore.isFondo) { return }

  await $axios?.get(`/users/current`, {
    // @ts-ignore FIXME
    silent: true
  })
    .then(({ data }) => {      
      usersStore.assignUserDetails(data as LoginResponse, true)
    })
    .catch(console.error)

  await new Promise(r => setTimeout(r, (import.meta.env.DEV ? 10 * 60 : 5) * 1000))

  reloadCurrentUser()
}, 1000, { leading: true, trailing: false })

// Watchers
const unwatchUser = watch(() => usersStore.isLogged, () => {
  reloadCurrentUser()
}, { immediate: true })

onBeforeUnmount(() => {
  unwatchUser()
})

// Providers
provide(appReloadCurrentUserInjectionKey, reloadCurrentUser)
</script>