<template>
  <v-form ref="formEl" lazy-validation v-model="form.status" @submit.prevent="handleSubmit">
    <div v-if="!readonly" class="text-h4 mb-2">{{ $t('registration.title') }}</div>
    <div v-if="!readonly" class="text-subtitle-1 mb-5">{{ $t('registration.subtitle') }}</div>

    <card-container
      v-for="(card, i) of htmlStructure.cards" :key="i"
      :title="$t(`registration.${card.title || i}`)"
      :variant="structureId ? 'outlined' : undefined"
      :elevation="structureId ? '0' : undefined"
      class="mb-5" v-show="card.show === undefined || card.show()">
      <v-row>
        <v-col v-for="(field, j) of card.fields" :key="`${i}-${j}`"
          cols="12"
          :lg="field.fullWidth || field.type === 'br' ? 12 : 4"
          :class="{ 'ma-0 pa-0': field.type === 'br' }"
          v-show="field.show === undefined || field.show()"
        
        >

          <span v-if="field.type === 'br'" />

          <v-radio-group v-else-if="field.radios" v-model="field.value" inline hide-details="auto"
            :rules="field.show === undefined || field.show() ? field.rules || [] : []"
            >
            <template v-slot:label>
              {{ $t(`registration.${field.label}`) }}
            </template>

            <v-radio v-for="radio in field.radios" :key="`${i}-${j}-radio-${radio.value}`" :value="radio.value">
              <template v-slot:label>
                {{ $t(radio.label) }}
              </template>
            </v-radio>
          </v-radio-group>

          <template v-else-if="field.checkboxes">
            <v-checkbox v-for="checkbox in field.checkboxes" v-model="field.value"
              :key="`${i}-${j}-checkbox-${checkbox.value}`" :value="checkbox.value" inline density="compact"
              hide-details="auto" :rules="field.show === undefined || field.show() ? field.rules || [] : []"
              >
              <template v-slot:label>
                {{ $t(checkbox.label) }}
              </template>
            </v-checkbox>
          </template>

          <span v-else-if="readonly && field.type === 'file'">
            <!-- TODO download file link -->
          </span>

          <v-file-input
            v-else-if="field.type === 'file'"
            hide-details="auto"
            color="koperniko-secondary"
            variant="outlined"
            :label="$t(`registration.${field.label}`)" :type="field.type || 'text'"
            :rules="field.show === undefined || field.show() ? field.rules || [] : []"
            prepend-icon=""
            prepend-inner-icon="mdi-file"
            v-model="htmlStructure.cards[i].fields[j].value"
          />

          <v-text-field
            v-else
            :disabled="!!field.readonly"
            hide-details="auto"
            color="koperniko-secondary"
            variant="outlined"
            :label="$t(`registration.${field.label}`)" :type="field.type || 'text'"
            :rules="field.show === undefined || field.show() ? field.rules || [] : []"
            v-model="htmlStructure.cards[i].fields[j].value"
          />
        </v-col>
      </v-row>
    </card-container>

    <v-alert v-if="!form.status && form.hasErrors" type="error" class="my-5">{{ $t('validation.errors.validationFail') }}</v-alert>
    <v-alert v-if="readonly && updated.show" type="success">{{ $t('registration.updated') }}</v-alert>
    <v-btn v-if="!requestSent || readonly" type="submit" class="d-block mx-auto mt-5" size="large" color="koperniko-primary"
      :loading="isLoading">
      {{ $t('confirm') }}
    </v-btn>

    <v-alert v-else-if="!readonly" type="success">{{ $t('registration.requestSent') }}</v-alert>
  </v-form>
</template>

<script setup lang="ts">
import { type Ref, ref, reactive, computed, type ComputedRef, type GlobalComponents, inject, watch, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import CardContainer from '@/components/common/CardContainer.vue'
import OrganizationType from '@/enums/OrganizationType'
import CompanyType from '@/enums/CompanyType'
import StructureTypeEnum from '@/enums/StructureTypeEnum'
import { cloneDeep, each, map } from 'lodash'
import { serialize } from 'object-to-formdata'
import { useToggle } from '@vueuse/shared'
import { axiosInjectKey } from '@/utils/axios'
import { emailValidation, requiredValidation, codFiscaleOrPivaValidation, pivaValidation, type ValidationRule } from '@/validation/rules'

// Stores
const usersStore = useUsersStore()

interface RadioCheckboxInterface {
  label: string
  value: string | number | boolean
}

interface FieldInterface {
  label?: string
  value?: any
  rules?: ValidationRule[]
  radios?: RadioCheckboxInterface[]
  checkboxes?: RadioCheckboxInterface[]
  fullWidth?: boolean
  type?: 'text' | 'date' | 'file' | 'br'
  show?: () => boolean
}

interface CardInterface {
  title?: string
  fields: FieldInterface[]
  show?: () => boolean
}

interface HtmlStructureInterface {
  cards: Record<string, CardInterface>
}

// Props
const props = defineProps<{
  readonly?: boolean
  structureId?: number
}>()

const booleanRadio = [
  {
    label: 'yes',
    value: true,
  },
  {
    label: 'no',
    value: false,
  },
]

const $axios = inject(axiosInjectKey)

const form = reactive({ status: true, hasErrors: false })

const updated = reactive({ show: false })

const htmlStructure: HtmlStructureInterface = reactive({
  cards: {
    structureDetails: {
      fields: [
        { label: 'business_name', value: '', rules: [requiredValidation], readonly: props.readonly },
        { label: 'fiscal_code', value: '', rules: [requiredValidation, codFiscaleOrPivaValidation], readonly: props.readonly },
        { label: 'vat_number', value: '', rules: [requiredValidation, pivaValidation], readonly: props.readonly },
        { label: 'address', value: '', rules: [requiredValidation], readonly: false},
        { label: 'city', value: '', rules: [requiredValidation], readonly: false },
        { label: 'province', value: '', rules: [requiredValidation], readonly: false },
        { label: 'postal_code', value: '', rules: [requiredValidation], readonly: false },
        { label: 'region', value: '', rules: [requiredValidation], readonly: false },
        { label: 'website', value: '', rules: [], readonly: false },
        { label: 'phone_number', value: '', rules: [requiredValidation], readonly: false },
      ]
    },
    structureContact: {
      show: () => !props.structureId,
      fields: [
        { label: 'contact_name', value: '', rules: [requiredValidation], readonly: false  },
        { label: 'contact_surname', value: '', rules: [requiredValidation], readonly: false  },
        { label: 'contact_email', value: '', rules: [requiredValidation, emailValidation], readonly: false  },
        { label: 'contact_phone_number', value: '', rules: [requiredValidation],readonly: false  },
      ]
    },
    organizationalType: {
      fields: [
        {
          label: 'organization_type', value: null, rules: [requiredValidation], fullWidth: true, radios:
            Object.keys(OrganizationType).filter((v) => isNaN(Number(v))).map((key) => ({
              // @ts-ignore FIXME
              label: `enums.organizationType_${OrganizationType[key]}`,
              // @ts-ignore FIXME
              value: OrganizationType[key],
            })), 
            readonly: false 
        },
        { label: 'withholding_tax', value: true, rules: [requiredValidation], fullWidth: true, radios: cloneDeep(booleanRadio), show: () => hasRitenutaAcconto.value, readonly: false  },
      ]
    },
    companyType: {
      show: () => isCompany.value,
      fields: [
        {
          label: 'company_type', value: null, rules: [requiredValidation], show: () => isCompany.value, fullWidth: true, radios:
            Object.keys(CompanyType).filter((v) => isNaN(Number(v))).map((key) => ({
              // @ts-ignore FIXME
              label: `enums.companyType_${CompanyType[key]}`,
              // @ts-ignore FIXME
              value: CompanyType[key],
            })),
            readonly: false 
        }
      ]
    },
    healthAuthorization: {
      fields: [
        { label: 'health_authorization_released_by', value: '', rules: [requiredValidation], readonly: false  },
        { label: 'health_authorization_number', value: '', rules: [requiredValidation], readonly: false  },
        { label: 'health_authorization_date', value: '', type: 'date', rules: [requiredValidation], readonly: false  },
        { label: 'health_authorization_document', value: [], type: 'file', fullWidth: true, rules: [requiredValidation], readonly: true  },
        { label: 'health_authorization_health_director', value: '', rules: [requiredValidation], fullWidth: true, readonly: false  },
      ]
    },
    structureType: {
      fields: [
        {
          label: 'structure_type', value: [], rules: [requiredValidation], fullWidth: true, checkboxes:
            Object.keys(StructureTypeEnum).filter((v) => isNaN(Number(v))).map((key) => ({
              // @ts-ignore FIXME
              label: `enums.structureType_${StructureTypeEnum[key]}`,
              // @ts-ignore FIXME
              value: StructureTypeEnum[key],
            })),
            readonly: false 
        }
      ]
    },
    disbursementSchemes: {
      fields: [
        { label: 'disbursement_schemes_national_health_service', value: null, rules: [requiredValidation], fullWidth: true, radios: cloneDeep(booleanRadio), readonly: false  },
        { label: 'disbursement_schemes_document', value: [], type: 'file', rules: [requiredValidation], fullWidth: true, show: () => hasDisbursementSchemes.value, readonly: true   },
        { type: 'br' },
        { label: 'disbursement_schemes_direct_form', value: null, rules: [requiredValidation], fullWidth: true, radios: cloneDeep(booleanRadio), show: () => hasDisbursementSchemes.value, readonly: false   },
        { label: 'disbursement_schemes_private_activities', value: null, rules: [requiredValidation], fullWidth: true, radios: cloneDeep(booleanRadio), readonly: false   },
        { label: 'disbursement_schemes_private_intramoenia_activities', value: null, rules: [requiredValidation], fullWidth: true, radios: cloneDeep(booleanRadio), readonly: false   },
      ]
    },
    mogUpdate: {
      show: () => props.structureId,
      fields: [
        { label: 'mog.label', value: null, rules: [requiredValidation], fullWidth: true, radios: cloneDeep(booleanRadio), show: () => props.structureId  },
      ]
    },
  }
})

const hasRitenutaAcconto: ComputedRef<boolean> = computed(() =>
  ([OrganizationType.STUDIO_ASSOCIATO, OrganizationType.STUDIO_PROFESSIONALE] as number[])
    .includes(htmlStructure?.cards?.organizationalType?.fields[0]?.value as number || 0)
)
const isCompany: ComputedRef<boolean> = computed(() =>
  ([OrganizationType.SOCIETA] as number[])
    .includes(htmlStructure?.cards?.organizationalType?.fields[0]?.value as number || 0)
)
const hasDisbursementSchemes: ComputedRef<boolean> = computed(() =>
  !!htmlStructure?.cards?.disbursementSchemes?.fields[0]?.value
)
const fields: ComputedRef<Record<string, any>> = computed(() => {
  const _fields = {}

  each(htmlStructure.cards, (card) => {
    each(card.fields, (f) => {
      if (f.label === undefined || f.value === undefined) { return }
      let value = f.value
      if (f.type === 'file') {
        value = f.value && f.value.length ? f.value[0] : null
      }
      Object.assign(_fields, { [f.label]: value })
    })
  })

  return _fields
})

// Watchers
watch(isCompany, (is) => {
  htmlStructure.cards.organizationalType.fields[1].value = !is
  if (!is) {
    htmlStructure.cards.companyType.fields[0].value = null
  }
})

watch(hasDisbursementSchemes, (has) => {
  if (has) { return }
  htmlStructure.cards.disbursementSchemes.fields[1].value = ''
  htmlStructure.cards.disbursementSchemes.fields[3].value = null
})

// VueUse composables
const [isLoading, toggleLoading] = useToggle(false)
const [requestSent, toggleRequestSent] = useToggle(false)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Fucntions
const handleSubmit = async () => {
  if(props.structureId){ updated.show = false}

  // if (!formEl.value) { return }

  // await formEl.value.validate()

  // if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  const formData = serialize(fields.value, {
    indices: true,
    booleansAsIntegers: true,
    allowEmptyArrays: true
  })
  if(props.structureId){
    await $axios?.['put'](`/registration-request${ props.structureId ? `/${props.structureId}` : '' }`, fields.value, {
    
  })
    .then(() => {
      formEl.value?.reset()
      toggleRequestSent()
      loadData()
      if(props.structureId){ updated.show = true}
    })
    .catch(console.error)

  toggleLoading()
  } else {

    await $axios?.['post'](`/registration-request`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then(() => {
      loadData()
      formEl.value?.reset()
      toggleRequestSent()
    })
    .catch(console.error)

  toggleLoading()

  }
  
}

const loadData = async () => {
  if (!props.structureId) { return }

  toggleLoading()

  await $axios?.get(`/registration-request/${props.structureId}`)
    .then(({ data }) => {

      htmlStructure.cards.structureDetails.fields[0].value = data.business_name
      htmlStructure.cards.structureDetails.fields[1].value = data.fiscal_code
      htmlStructure.cards.structureDetails.fields[2].value = data.vat_number
      htmlStructure.cards.structureDetails.fields[3].value = data.address
      htmlStructure.cards.structureDetails.fields[4].value = data.city
      htmlStructure.cards.structureDetails.fields[5].value = data.province
      htmlStructure.cards.structureDetails.fields[6].value = data.postal_code
      htmlStructure.cards.structureDetails.fields[7].value = data.region
      htmlStructure.cards.structureDetails.fields[8].value = data.website
      htmlStructure.cards.structureDetails.fields[9].value = data.phone_number

      htmlStructure.cards.organizationalType.fields[0].value = data.organization_type
      htmlStructure.cards.organizationalType.fields[1].value = data.withholding_tax === 1

      htmlStructure.cards.companyType.fields[0].value = data.company_type

      htmlStructure.cards.healthAuthorization.fields[0].value = data.health_authorization_released_by
      htmlStructure.cards.healthAuthorization.fields[1].value = data.health_authorization_number
      htmlStructure.cards.healthAuthorization.fields[2].value = data.health_authorization_date
      // htmlStructure.cards.healthAuthorization.fields[3].value = data.health_authorization_document
      htmlStructure.cards.healthAuthorization.fields[4].value = data.health_authorization_health_director

      htmlStructure.cards.structureType.fields[0].value = map(data.structure_types || [], (type: Record<string, any>) => type.type)

      htmlStructure.cards.disbursementSchemes.fields[0].value = data.disbursement_schemes_national_health_service === 1
      // htmlStructure.cards.disbursementSchemes.fields[1].value = data.disbursement_schemes_document
      htmlStructure.cards.disbursementSchemes.fields[3].value = data.disbursement_schemes_direct_form === 1
      htmlStructure.cards.disbursementSchemes.fields[4].value = data.disbursement_schemes_private_activities === 1
      htmlStructure.cards.disbursementSchemes.fields[5].value = data.disbursement_schemes_private_intramoenia_activities === 1

      htmlStructure.cards.mogUpdate.fields[0].value = data.mog === 1

    })
    .catch(console.error)

  toggleLoading()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
::v-deep {
  label {
    white-space: normal;
  }
}
</style>
