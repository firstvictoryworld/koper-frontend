<template>
  <v-card>
    <v-card-text>
      <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
        <v-row>
          <template v-for="(field, key) of fields" :key="key">
            <v-col v-if="field.type !== 'hidden'" cols="12" :md="field.type === 'separator' ? 12 : 4">

              <v-divider v-if="field.type === 'separator'" />

              <v-checkbox :v-show="!isStruttura.value"
                v-else-if="field.type === 'checkbox'"
                v-model="field.value"
                :true-value="1"
                :false-value="0"
                :label="$t(`users.edit.${key}`)"
                hide-details="auto"
                :rules="field.rules"
              />

              <v-text-field
                v-else
                v-model="field.value"
                :label="$t(`users.edit.${key}`)"
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
        </v-col>
      </v-row>
    

  </template>
  
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users';
import { axiosInjectKey } from '@/utils/axios';
import { emailValidation, requiredValidation } from '@/validation/rules';
import { useToggle } from '@vueuse/shared';
import { each, mapValues } from 'lodash';
import { computed, inject, onBeforeMount, onMounted, reactive, ref, type GlobalComponents, type Ref } from 'vue';
import UserTypes from '@/enums/UserTypesEnum'

const props = defineProps<{
  userId: null|number
  structureId: undefined|number
}>()

const $axios = inject(axiosInjectKey)

const form = reactive({ status: true, hasErrors: false })
const fields = reactive({
  id: { value: props.userId, rules: [], type: 'hidden' },
  type: { value: 0, rules: [], type: 'separator' },
  name: { value: '', rules: [requiredValidation], type: 'text' },
  surname: { value: '', rules: [requiredValidation], type: 'text' },
  email: { value: '', rules: [requiredValidation, emailValidation], type: 'text' },
  separator1: { value: null, rules: [], type: 'separator' },
  tariff: { value: 0, rules: [], type: 'checkbox',  show: () => false},
  doctors: { value: 0, rules: [], type: 'checkbox'},
  negotiation: { value: 0, rules: [], type: 'checkbox' },
  deeds: { value: 0, rules: [], type: 'checkbox' },
  certification: { value: 0, rules: [], type: 'checkbox' },
  bookings: { value: 0, rules: [], type: 'checkbox' },
  registry: { value: 0, rules: [], type: 'checkbox' },
  reconciliation: { value: 0, rules: [], type: 'checkbox' },
  separator3: { value: null, rules: [], type: 'separator' },
})

// Computed
const isEditing = computed(() => !!fields.id.value)
const isStruttura = computed(() => fields.type.value === UserTypes.STRUTTURA)

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

  await $axios[isEditing.value ? 'put' : 'post'](`/users${ isEditing.value ? `/${fields.id.value}` : '' }`, _fields)
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

  await $axios?.get(`/users/${fields.id.value || ''}`)
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
