<template>
  <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
    <v-row>
      <template v-for="(field, key) of fields" :key="key">
        <v-col v-if="field.type !== 'hidden'" cols="12" md="12">
          <v-text-field
            v-model="field.value"
            :label="$t(`specializations.edit.${key}`)"
            variant="outlined"
            hide-details="auto"
            :rules="field.rules"
          />
        </v-col>
      </template>
    </v-row>

    <v-btn type="submit" class="d-block ml-auto mt-5" size="large" color="koperniko-primary" :loading="isLoading">
      {{ $t('confirm') }}
    </v-btn>

    <template v-if="isEditing">
      <v-divider class="my-10" />
      <SpecializationLedingsComponent :specialization-id="fields.id.value" />
    </template>

  </v-form>
</template>

<script setup lang="ts">
import { axiosInjectKey } from '@/utils/axios'
import { requiredValidation } from '@/validation/rules'
import { useToggle } from '@vueuse/shared'
import { each, mapValues } from 'lodash'
import { computed, inject, onMounted, reactive, ref, type GlobalComponents, type Ref } from 'vue'
import SpecializationLedingsComponent from './SpecializationLedingsComponent.vue'

const props = defineProps<{
  specializationId: null | number | string
}>()

const $axios = inject(axiosInjectKey)

const form = reactive({ status: true, hasErrors: false })
const fields = reactive({
  id: { value: props.specializationId, rules: [], type: 'hidden' },
  name: { value: '', rules: [requiredValidation], type: 'text' },
})

// Computed
const isEditing = computed(() => !!fields.id.value)

// Events
const emit = defineEmits(['updated']);

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions

const handleSubmit = async () => {

  if (!formEl.value || !$axios) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  const _fields = mapValues(fields, field => field.value)

  await $axios[isEditing.value ? 'put' : 'post'](`/specializations${ isEditing.value ? `/${fields.id.value}` : '' }`, _fields)
    .then(({ data }) => {
      fields.id.value = data.id
      formEl.value?.resetValidation()
      emit('updated')
    })
    .catch(console.error)

  toggleLoading()
}

const loadData = async () => {
  if (!isEditing.value) { return }

  toggleLoading()

  await $axios?.get(`/specializations/${fields.id.value}`)
    .then(({ data }) => {

      const keys = Object.keys(data) as (keyof typeof fields)[] 

      each(keys, key => {
        if (!fields[key]) { return }
        fields[key].value = data[key]
      })
    })
    .catch(console.error)

  toggleLoading()
}

onMounted(() => {
  loadData()
})
</script>
