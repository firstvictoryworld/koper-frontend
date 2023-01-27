<template>
  <v-card>
    <v-card-text>
      <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
        <v-row>
          <template v-for="(field, key) of fields" :key="key">
            <v-col v-if="field.type !== 'hidden'" cols="12" :md="field.type === 'separator' ? 12 : 4">

              <v-divider v-if="field.type === 'separator'" />

              <StructureAutocompleteComponent
                v-else-if="field.type === 'autoStructure'"
                v-model:value="field.value"
              />

              <v-checkbox
                v-else-if="field.type === 'checkbox'"
                v-model="field.value"
                :true-value="1"
                :false-value="0"
                :label="$t(`doctors.edit.${key}`)"
                hide-details="auto"
                :rules="field.rules"
              />

              <v-text-field
                v-else
                v-model="field.value"
                :label="$t(`doctors.edit.${key}`)"
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
      </v-form>
    </v-card-text>
  </v-card>

  <template v-if="isEditing">
      <v-row class="align-center pt-1 w-100 mr-6">
        <v-col cols="12" :md="true">
          <SpecializationAutocompleteComponent v-model:value="fields.value" :not-doctor="doctorId" />
        </v-col>
      </v-row>
    

    <DoctorLedingsComponent :doctor-id="fields.id.value" />
  </template>
  
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users';
import { axiosInjectKey } from '@/utils/axios';
import { codFiscaleValidation, requiredValidation } from '@/validation/rules';
import { useToggle } from '@vueuse/shared';
import { each, mapValues } from 'lodash';
import { computed, inject, onMounted, reactive, ref, type GlobalComponents, type Ref } from 'vue';
import StructureAutocompleteComponent from '../autocomplete/StructureAutocompleteComponent.vue'
import DoctorLedingsComponent from './DoctorLedingsComponent.vue'

const props = defineProps<{
  doctorId: null|number
}>()

const $axios = inject(axiosInjectKey)
const usersStore = useUsersStore()

const form = reactive({ status: true, hasErrors: false })
const fields = reactive({
  id: { value: props.doctorId, rules: [], type: 'hidden' },
  name: { value: '', rules: [requiredValidation], type: 'text' },
  surname: { value: '', rules: [requiredValidation], type: 'text' },
  structure_data_id: { value: usersStore.isStruttura ? usersStore.userDetails.structureId : '', rules: [requiredValidation], type: usersStore.isStruttura ? 'hidden' : 'autoStructure' },
  fiscal_code: { value: '', rules: [requiredValidation, codFiscaleValidation], type: 'text' },
  separator1: { value: null, rules: [], type: 'separator' },
  active: { value: 1, rules: [], type: 'checkbox' },
  separator2: { value: null, rules: [], type: 'separator' },
  recovery: { value: 0, rules: [], type: 'checkbox' },
  interventions: { value: 0, rules: [], type: 'checkbox' },
  visits: { value: 0, rules: [], type: 'checkbox' },
  private_rate: { value: 0, rules: [], type: 'checkbox' },
  online: { value: 0, rules: [], type: 'checkbox' },
  separator3: { value: null, rules: [], type: 'separator' },
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

  await $axios[isEditing.value ? 'put' : 'post'](`/doctors${ isEditing.value ? `/${fields.id.value}` : '' }`, _fields)
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

  await $axios?.get(`/doctors/${fields.id.value || ''}`)
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
