<template>
  <v-dialog
    v-bind:model-value="dialog.localShow"
    :scrim="true"
    persistent
    transition="dialog-bottom-transition"
    max-width="600"
  >
    <v-card v-if="dialog.localShow" :loading="isLoading" color="grey-lighten-4">
      <v-toolbar
        dark
        color="koperniko-primary"
      >
        <v-toolbar-title>
          {{ $t('lendings.documents.title') }}
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <v-btn icon dark @click="() => close()" >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <v-window v-model="dialog.tab">
          <v-window-item value="list">
            <DataTable ref="refTable" :cols="cols" :url="baseUrl" local-prefix="lendings.documents." class="mb-3">
              <template #header>
                <v-btn v-if="canEdit" variant="flat" color="koperniko-primary" class="mr-3" @click="() => edit()">
                  {{ $t('add') }} 
                </v-btn>
              </template>

              <template #col-required="{ row }">
                <icon v-if="!!row.required" color="green accent-2">
                  mdi-check
                </icon>
              </template>
            </DataTable>
          </v-window-item>

          <v-window-item v-if="canEdit" value="edit">
            <v-form ref="formEl" lazy-validation v-model="form.status" class="mt-1" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.fields.name.value"
                    v-bind="form.fields.name.binds"
                    :label="$t(`lendings.documents.name`)"
                  />
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="form.fields.required.value"
                    v-bind="form.fields.required.binds"
                    :label="$t(`lendings.documents.required`)"
                    :true-value="1"
                    :false-value="0"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-5" />

              <div class="d-flex justify-end">
                <v-btn size="large" color="koperniko-secondary" variant="plain" class="mr-3" @click="() => dialog.tab = 'list'">
                  {{ $t('back') }}
                </v-btn>

                <v-btn type="submit" size="large" color="koperniko-primary" :loading="isLoading">
                  {{ $t('confirm') }}
                </v-btn>
              </div>
            </v-form>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DatatableColInterface } from '@/@types'
import { useUsersStore } from '@/stores/users'
import { axiosInjectKey } from '@/utils/axios'
import { requiredValidation } from '@/validation/rules'
import { useToggle } from '@vueuse/shared'
import { reactive, ref, type Ref, type GlobalComponents, inject, computed, watch, onBeforeUnmount } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import DataTable from '../common/DataTable.vue'

interface Props {
  lendingId: number,
  show: boolean
}

interface DocumentInterface {
  id: number
  name: string
  required: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

const $axios = inject(axiosInjectKey)
const userStore = useUsersStore()

// Computed
const baseUrl = computed(() => `/lendings/${props.lendingId}/documents`)
const canEdit = computed(() => userStore.isAdmin)

// Togglers
const [isLoading, toggleLoading] = useToggle()
const [isDeleting, toggleDelete] = useToggle()

const cols = reactive([
  { key: 'name' },
  { key: 'required', colProps: { style: 'width:10px' }},
  { label: '', key: '', actions:
    canEdit.value
    ? [
      { icon: 'mdi-pencil', handler(row: DocumentInterface) { edit(row) }, btnProps: { class: 'mr-3' } },
      { icon: 'mdi-delete', handler(row: DocumentInterface) { remove(row) }, color: 'red', btnProps: { loading: isDeleting } },
    ]
    : [] 
  },
] as DatatableColInterface[])

const dialog = reactive({
  localShow: false,
  tab: 'list' as 'list' | 'edit'
})

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto'
} as Partial<VInput>

const form = reactive({
  status: true,
  hasErrors: false,
  documentId: null as null | number,
  fields: {
    name: { value: '', binds: { rules: [requiredValidation], type: 'text', ...defaultInputBinds } },
    required: { value: 0, binds: { rules: [], type: 'checkbox', ...defaultInputBinds } },
  }
})



// Events
const emit = defineEmits(['update:show'])

// Elements
const refTable: Ref<null | GlobalComponents['VForm']> = ref(null)
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Watchers
const unwatchShow = watch(() => props.show, (show: boolean) => {
  if (!show) { return }
  dialog.localShow = true
})

// Functions
const handleSubmit = async () => {
  if (!$axios || !formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  const { documentId } = form
  const url = baseUrl.value + (documentId ? `/${documentId}` : '')
  const method = /\/[0-9]+$/.test(url) ? 'put' : 'post'

  $axios.request({
    url,
    method,
    data: {
      name: form.fields.name.value,
      required: form.fields.required.value,
    }
  })
    .then(() => {
      refTable.value?.loadData()
      dialog.tab = 'list'
    })
    .catch(console.error)

  toggleLoading()
}

const remove = async (row: DocumentInterface) => {
  toggleDelete()

  const url = baseUrl.value + `/${row.id}`

  await $axios?.delete(url)
    .then(() => {
      refTable.value?.loadData()
    })
    .catch(console.error)

  toggleDelete()
}

const close = async () => {
  dialog.localShow = false
  await (new Promise(r => setTimeout(r, 600)))
  emit('update:show', false)
}

const edit = (row?: DocumentInterface) => {
  const { id, name, required } = row || {}
  form.documentId = id || null
  form.fields.name.value = name || ''
  form.fields.required.value = required ? 1 : 0
  dialog.tab = 'edit'
}

onBeforeUnmount(() => {
  unwatchShow()
})
</script>
