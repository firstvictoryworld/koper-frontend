<template>
  <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
    <div v-if="!readonly" class="text-subtitle-1 mb-5">{{ $t('registration.contacts.subtitle') }}</div>
    <ContactForm v-for="(field, i) in fields.contacts" :key="field.type" v-model:data="fields.contacts[i]" class="mb-5" :readonly="false"/>
    <v-card v-if="props.show">
      <v-card-text>
        <v-alert v-if="!form.status && form.hasErrors" type="error" class="mb-5">{{ $t('validation.errors.validationFail') }}</v-alert>
        <v-alert v-if="readonly && updated.show" type="success">{{ $t('registration.updated') }}</v-alert>

        <v-btn type="submit" class="d-block mx-auto" size="large" color="koperniko-primary" block
          :loading="isLoading">
          {{ $t('confirm') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref, type GlobalComponents, type Ref, onMounted } from 'vue'
import ContactTypeEnum from '@/enums/ContactTypeEnum'
import { map } from 'lodash'
import ContactForm from '../registration/ContactForm.vue'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { useUsersStore } from '@/stores/users'
import { appReloadCurrentUserInjectionKey } from '@/utils/koperniko'

const $axios = inject(axiosInjectKey)
const $reloadCurrentUser = inject(appReloadCurrentUserInjectionKey)
const usersStore = useUsersStore()

const form = reactive({ status: true, hasErrors: false })

const updated = reactive({ show: false })

// Props
const props = defineProps<{
  readonly?: boolean
  structureId?: number
  show?: boolean
}>()

const contactTypes = computed(() =>
  Object.keys(ContactTypeEnum).filter(x => !(parseInt(x) >= 0))
)

const fields = reactive({
  contacts: map(contactTypes.value, type => ({
    type: ContactTypeEnum[type as keyof typeof ContactTypeEnum],
    email: '',
    name: '',
    surname: '',
    phone: '',
    mobile: ''
  }))
})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions
const handleSubmit = async () => {
  
  updated.show = false

  $reloadCurrentUser && $reloadCurrentUser()

  if (!formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  await $axios?.put(`/registration-request/${props.structureId}/complete`, fields)
    .then(async () => {
      $reloadCurrentUser && await $reloadCurrentUser()
      if(props.structureId){ updated.show = true }
    })
    .catch(console.error)

  toggleLoading()
}

const loadData = async () => {
  if (!props.structureId) { return }

  toggleLoading()

  await $axios?.get(`/registration-request/${props.structureId}`)
    .then(({ data }) => {
      fields.contacts.forEach((contact, key) => {
        
        contact.type = data.structure_contacts[key].type
        contact.email = data.structure_contacts[key].email
        contact.name = data.structure_contacts[key].name
        contact.surname = data.structure_contacts[key].surname
        contact.phone = data.structure_contacts[key].phone
        contact.mobile = data.structure_contacts[key].mobile
       
      });
     
    })
    .catch(console.error)

  toggleLoading()
}

onMounted(() => {
  loadData()
})
</script>
