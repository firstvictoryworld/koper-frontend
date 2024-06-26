<template>
  <v-card :loading="isLoading" color="grey-lighten-4" 
    class="mx-auto"
    max-width="700">

  <v-card-text>
    <v-form ref="formDialogEl" lazy-validation v-model="formDialog.status" @submit.prevent="handleSubmit">
      <v-alert class="mb-5" type="info" cols="6" >{{ $t('certifications.upload.info') }}</v-alert>
      <v-row>
       
        <template v-for="(field, key) of dialog.fields" :key="key">

          <v-col v-if="!field.show || field.show()" cols="12" >
            <v-file-input v-if="field.binds.type === 'file'" v-model="field.value" v-bind="field.binds"
              :label="$t(`certifications.upload.file`)"
              prepend-icon="" prepend-inner-icon="mdi-file" />
          </v-col>
        </template>
      </v-row>

      <v-divider class="my-5" />
      <v-alert v-if="formDialog.success" type="success" cols="12" class="mb-5">{{ $t('certifications.upload.success') }}</v-alert>
      <div class="d-flex justify-end">
        <v-btn type="submit" size="large" color="koperniko-primary" :loading="isLoading">
          {{ $t('confirm') }}
        </v-btn>
      </div>
    </v-form>
   
  </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { DatatableComponent, FieldInterface } from '@/@types'
import { axiosInjectKey } from '@/utils/axios'
import { requiredValidation } from '@/validation/rules'
import { reactive, ref, type Ref, inject, type GlobalComponents } from 'vue'
import type { VInput } from 'vuetify/lib/components/VInput/index'
import { useToggle } from '@vueuse/shared'
import { serialize } from 'object-to-formdata'
import JsFileDownloader from 'js-file-downloader'
import { useUsersStore } from '@/stores/users';
import { each } from 'lodash'

const usersStore = useUsersStore()

const defaultInputBinds = {
  variant: 'outlined',
  hideDetails: 'auto'
} as Partial<VInput>

const dialog = reactive({
  show: false,
  fields: {
    file: { value: undefined, binds: { rules: [requiredValidation], type: 'file', ...defaultInputBinds } },
  } as Record<string, FieldInterface>,
})

const $axios = inject(axiosInjectKey)

// VueUse composables
const [isDownloading, toggleDownload] = useToggle()
const [isLoading, toggleLoading] = useToggle()

// Events
const emit = defineEmits(['updated']);

// Elements
const refTable: Ref<null | DatatableComponent> = ref(null)
const formDialogEl: Ref<null | GlobalComponents['VForm']> = ref(null)

const formDialog = reactive({
  status: true,
  hasErrors: false,
  success: false
})

// Functions

const handleSubmit = async () => {

  formDialog.success = false

  if (!formDialogEl.value || !$axios) { return }

  await formDialogEl.value.validate()

  if (!formDialog.status) { return formDialog.hasErrors = true }

  formDialog.hasErrors = false

  toggleLoading()

  const path = `uniquecertification`
  const data = {}

  each(dialog.fields, (field, key) => {
    let { value, binds } = field
    if (binds.type === 'file' && value?.length) {
      value = value[0]
    }

    Object.assign(data, { [key]: value })
  })

  const formData = serialize(data, {
    indices: true,
    booleansAsIntegers: true,
    allowEmptyArrays: true
  })


  $axios?.post(path, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then((data) => {
      refTable.value?.loadData()
      if(data.status === 204) { formDialog.success = true }
    })
    .catch(console.error)

  toggleLoading()
}


</script>
