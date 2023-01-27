<template>
  <!-- If deleted -->
  <span v-if="!!data.deleted_at" />

  <!-- Leaf lending -->
  <v-form v-else-if="isHeader || !data.is_category" ref="formEl" lazy-validation v-model="form.status" class="d-block w-100" @submit.prevent="store">        
    <v-row dense class="w-100 px-2 flex-nowrap" :class="{
      'py-2': !isHeader,
      'row-odd': !isHeader && indexes[indexes.length - 1] % 2 !== 0
    }">
      <v-col v-if="!isHeader && agreementMode && usersStore.isStruttura" cols="auto">
        <v-checkbox
          hide-details="auto"
          color="koperniko-secondary"
          variant="outlined"
          :true-value="1"
          :false-value="0"
          density="compact"
          :disabled="!agreeable"
          :readonly="!!props.data.structure_cost"
          v-bind:model-value="props.data.selected || 0"
          @update:model-value="(value: any) => update('selected', value)"
        />
      </v-col>

      <template v-for="(field, i) in fields">    
        <v-col
          v-if="(isHeader && ['code', 'name'].includes(field.key)) || (!isHeader && fieldKeys.includes(field.key))"
          :key="`${indexes.join('-')}-${field.key}-${i}`"
          :cols="field.width ? 'auto' : true"
          :style="{ width: field.width ? `${field.width}px` : undefined }"
        >
          <template v-if="readonlyField || !activeFieldKeys.includes(field.key)">
            <div class="d-block lending-label text-caption">{{ field.label }}</div>
            <div class="d-block lending-value">{{
              field.key !== 'type'
                ? (props.data[field.key as keyof LendingInterface] || '-')
                : (locales.types[props.data[field.key as keyof LendingInterface] as any] || '-')
            }}</div>
          </template>

          <v-select
            v-else-if="field.key === 'type'"
            dirty
            hide-details="auto"
            color="koperniko-secondary"
            variant="outlined"
            :label="field.label"
            :items="lendingTypes"
            :item-title="item => item.label"
            :item-value="item => item.value"
            :rules="field.rules || []"
            density="compact"
            v-model.number="local.fields[field.key as keyof LendingInterface]"
          />

          <v-text-field
            v-else
            dirty
            hide-details="auto"
            color="koperniko-secondary"
            variant="outlined"
            :label="field.label"
            :type="field.type || 'text'"
            :rules="field.rules || []"
            density="compact"
            class="hide-arrows"
            v-model.number="local.fields[field.key as keyof LendingInterface]"
          />
        </v-col>
      </template>

      <v-col cols="auto" align-self="center" class="pl-3">
        <v-btn v-if="canEdit" variant="plain" icon color="koperniko-primary" density="comfortable" :disabled="isLoading" @click="() => modify()">
          <v-icon color="koperniko-primary">mdi-pencil</v-icon>
        </v-btn>

        <v-btn v-if="canSave" variant="plain" icon color="koperniko-primary" density="comfortable" :disabled="agreementMode && !props.data.selected" :loading="isLoading" type="submit">
          <v-icon color="koperniko-primary">mdi-content-save</v-icon>
        </v-btn>

        <v-btn v-if="canDelete" variant="plain" icon color="red" density="comfortable" :disabled="agreementMode && !props.data.selected" :loading="isLoading" @click="() => remove()">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>

        <v-btn v-if="canRestore" variant="plain" icon color="secondary" density="comfortable" :disabled="isLoading" @click="() => restore()">
          <v-icon color="secondary">mdi-restore</v-icon>
        </v-btn>

        <v-btn v-if="!isHeader && !agreementMode" variant="plain" icon color="koperniko-secondary" density="comfortable" :disabled="!data.id" @click="() => showDocuments()">
          <v-icon color="secondary">mdi-file-document-multiple</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-form>

  <!-- Lending container -->
  <CardContainer
    v-else
    :elevation="isChild ? 0 : undefined"
    :variant="isChild ? 'outlined' : undefined"
    :render-content-only-if-shown="false"
    :start-opened="false"
    :render-if-closed="false"
    class="mt-5"
  >
    <template #title>
      <SelfComponent
        :isHeader="true"
        :indexes="indexes"
        :readonly="readonly"
        :agreement-id="agreementId"
        :locales="props.locales"
        v-bind:data="data"
        @updated:deedOfAgreementId="data => emit('updated:deedOfAgreementId', data)"
      />
    </template>

    <template v-for="(child, i) in data.children" :key="`${data.code}-${i}`">
      <SelfComponent
        :isChild="true"
        :isFirst="i <= 0"
        :isLast="i + 1 === data.children.length"
        :readonly="readonly"
        :agreement-id="agreementId"
        :indexes="[ ...indexes, i ]"
        :locales="props.locales"
        v-bind:data="child"
        @updated:deedOfAgreementId="data => emit('updated:deedOfAgreementId', data)"
      />
    </template>

    <div v-if="canAddCategory || canAddLending" class="d-flex justify-center align-center" :class="{ 'mt-5': hasChildren }">
      <v-btn
        v-if="canAddCategory"
        variant="flat"
        color="koperniko-primary"
        @click="() => add(true)"
      >
        {{ props.locales.addCategoryLending }}
      </v-btn>

      <span v-if="canAddCategory && canAddLending" class="mx-5">o</span>

      <v-btn
        v-if="canAddLending"
        variant="flat"
        color="koperniko-primary"
        @click="() => add()"
      >
        {{ props.locales.addLending }}
      </v-btn>
    </div>
  </CardContainer>

  <LendingDocumentsComponent v-if="data.id" :lending-id="data.id" v-model:show="documents.show" />
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users'
import { axiosInjectKey } from '@/utils/axios'
import { requiredValidation, currencyValidation, type ValidationRule } from '@/validation/rules'
import { useToggle } from '@vueuse/shared'
import type { AxiosResponse } from 'axios'
import { clone, each, find, map, omit, pick } from 'lodash'
import { computed, inject, reactive, ref, type GlobalComponents, type Ref, type UnwrapNestedRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import CardContainer from '../common/CardContainer.vue'
import SelfComponent from './LendingComponent.vue'
import LendingDocumentsComponent from './LendingDocumentsComponent.vue'
import { getLendingsListObject } from './lendingLogic'
import { removeLending, updateLending, addLending, setupType } from './lendingLogic'

export interface LendingInterface {
  id: number | null
  code: string
  name: string
  parent_id: number | null
  type?: string
  inpatient: number
  outpatient: number
  dentistry: number
  prevention: number
  serious_illness: number
  refund_value?: number
  lending_cost?: number
  structure_cost?: number
  children: LendingInterface[]
  children_count?: number
  deleted_at: null | string
  is_category: boolean
  selected?: number | boolean
  lending_agreements?: LendingAgreededInterface[]
  editing?: boolean
}

export interface LendingProposalInterface {
  lending_cost: string
  user_type: number
}

export interface LendingAgreededInterface {
  id: number | null
  lending_id: number | null
  refund_value?: number
  lending_cost?: number
  current_lending_proposals: LendingProposalInterface[]
}

export interface Props {
  data: LendingInterface
  isChild?: boolean
  isHeader?: boolean
  isFirst?: boolean
  isLast?: boolean
  indexes: number[]
  readonly?: boolean
  agreementId?: number
  locales?: Record<string, any>
}

type KeysOfUnion<T> = T extends T ? keyof T: never;
type FieldKeys = KeysOfUnion<LendingInterface | { type: string }>
  
const props = withDefaults(defineProps<Props>(), {
  locales: () => {
    const i18n = useI18n()
    
    return { 
      code: i18n.t('lending.code'),
      name: i18n.t('lending.name'),
      type: i18n.t('lending.type'),
      types: {
        dentistry: i18n.t('lending.dentistry'),
        prevention: i18n.t('lending.prevention'),
        inpatient: i18n.t('lending.inpatient'),
        outpatient: i18n.t('lending.outpatient'),
        serious_illness: i18n.t('lending.serious_illness'),
      },
      refund_value: i18n.t('lending.refund_value'),
      lending_cost: i18n.t('lending.lending_cost'),
      structure_cost: i18n.t('lending.structure_cost'),
      addCategoryLending: i18n.t('lending.addCategoryLending'),
      addLending: i18n.t('lending.addLending'),
    }
  }
})

const lendingsList = getLendingsListObject()
const usersStore = useUsersStore()
const $axios = inject(axiosInjectKey)

const fields: UnwrapNestedRefs<{ key: FieldKeys, label: string; rules: ValidationRule[], type: string, width?: number }[]> = reactive([
  { key: 'code', label: props.locales.code, rules: [requiredValidation], type: 'text', width: 100 },
  { key: 'name', label: props.locales.name, rules: [requiredValidation], type: 'text' },
  { key: 'type', label: props.locales.type, rules: [requiredValidation], type: 'select' },
  { key: 'refund_value', label: props.locales.refund_value, rules: [requiredValidation, currencyValidation], type: 'number', width: 200 },
  { key: 'lending_cost', label: props.locales.lending_cost, rules: [requiredValidation, currencyValidation], type: 'number', width: 130 },
  { key: 'structure_cost', label: props.locales.structure_cost, rules: [requiredValidation, currencyValidation], type: 'number', width: 130 },
])

const local = reactive({
  backup: null as null | Record<FieldKeys, any>,
  fields: {
    code: props.data.code || '',
    name: props.data.name || '',
    type: props.data.type as undefined | number,
    refund_value: props.data.refund_value as undefined | number,
    lending_cost: props.data.lending_cost as undefined | number,
    structure_cost: props.data.structure_cost as undefined | number,
  } as Record<FieldKeys, any>,
})

const lendingTypes = reactive([
  { value: 'inpatient', label: props.locales.types.inpatient },
  { value: 'outpatient', label: props.locales.types.outpatient },
  { value: 'dentistry', label: props.locales.types.dentistry },
  { value: 'prevention', label: props.locales.types.prevention },
  { value: 'serious_illness', label: props.locales.types.serious_illness },
])

const form = reactive({ status: true, hasErrors: false })

const documents = reactive({ show: false })

// Togglers
const [isLoading, toggleLoading] = useToggle(false)

// Events
const emit = defineEmits(['updated:deedOfAgreementId']);

// Computed

const agreementMode = computed(() => props.agreementId !== undefined)
const editingAgreement = computed(() => agreementMode.value && props.agreementId !== undefined && props.agreementId > 0)

const level = computed(() => props.indexes.length - 1)

const hasChildren = computed(() => {
  return find(props.data.children || [], { deleted_at: null } as Partial<LendingInterface>) !== undefined
})

const canAddCategory = computed(() => {
  if (agreementMode.value || props.readonly || level.value >= 2 || !props.data.id) { return false }
  return !hasChildren.value || find(props.data.children, { is_category: true, deleted_at: null } as Partial<LendingInterface>) !== undefined
})

const canAddLending = computed(() => {
  if (agreementMode.value || props.readonly || !props.data.id) { return false }
  return !hasChildren.value || find(props.data.children, { is_category: false, deleted_at: null } as Partial<LendingInterface>) !== undefined
})

const fieldKeys = computed(() => agreementMode.value === true
  ? ['code', 'name', 'type', 'refund_value', 'lending_cost', 'structure_cost']
  : ['code', 'name', 'type', 'refund_value', 'lending_cost']
)

const activeFieldKeys = computed(() => agreementMode.value === true
  ? (
    usersStore.isStruttura ? ['structure_cost'] : ['lending_cost']
  )
  : map(fields, field => field.key)
)

const showActions = computed(() => 
  !props.readonly && (!agreementMode.value || !props.isHeader)
)

const canEdit = computed(() => 
  showActions.value && (!agreementMode.value && !props.data.editing)
)

const canSave = computed(() => 
  showActions.value && (agreementMode.value || props.data.editing)
)

const canRestore = computed(() => 
  showActions.value && (!agreementMode.value && props.data.editing && !!props.data.id)
)

const canDelete = computed(() => 
  showActions.value && (agreementMode.value || !props.data.editing || !props.data.id)
)

const readonlyField = computed(() => 
  props.readonly || (agreementMode.value && !props.data.selected) || (!agreementMode.value && !props.data.editing)
)

const agreeable = computed(() => 
  !props.readonly &&
  !!props.data.code &&
  !!props.data.name &&
  !!props.data.refund_value &&
  !!props.data.lending_cost
)

// Elements
const formEl: Ref<null | GlobalComponents['VForm']> = ref(null)

// Functions

const add = (asCategory = false) => {
  if (!lendingsList) { return }
  addLending(lendingsList, [...props.indexes, props.data.children.length -1], asCategory)
}

const modify = () => {
  if (!lendingsList) { return }
  local.backup = clone(local.fields)
  updateLending(lendingsList, props.indexes, 'editing', true)
}

const exitEditing = () => {
  if (!lendingsList) { return }
  updateLending(lendingsList, props.indexes, 'editing', false)
}

const update = (key: keyof LendingInterface, value: any) => {
  if (!lendingsList) { return }
  updateLending(lendingsList, props.indexes, key, value)
}

const store = async () => {
  if (!lendingsList || !$axios || !formEl.value) { return }

  await formEl.value.validate()

  if (!form.status) { return form.hasErrors = true }

  form.hasErrors = false

  toggleLoading()

  const { agreementId } = props
  const { id } = props.data
  const data = omit(local.fields, ['type'])

  Object.assign(data, {
    lending_id: id,
    parent_id: props.data.parent_id,
    inpatient: local.fields.type === 'inpatient',
    outpatient: local.fields.type === 'outpatient',
    dentistry: local.fields.type === 'dentistry',
    prevention: local.fields.type === 'prevention',
    serious_illness: local.fields.type === 'serious_illness',
  })

  const url = agreementMode.value
    ? `/agreements${!agreementId ? '' : `/${agreementId}`}`
    : `/lendings${!id ? '' : `/${id}`}`

  const method = !/.\/[0-9]+$/.test(url)
    ? 'post'
    : 'put'

  await $axios.request({
    url, method, data
  })
    .then((response) => {
      agreementMode.value
        ? storeAgreementRepsonseHandler(data, response)
        : storeRepsonseHandler(data, response)
    })
    .catch(console.error)

  exitEditing()
  toggleLoading()
}

const storeRepsonseHandler = (request: Record<string, any>, response: AxiosResponse) => {
  each(request, (value, key) => {
    update(key as keyof LendingInterface, value)
  })
  update('type', setupType(request))
  update('id', response.data.id)
}

const storeAgreementRepsonseHandler = (request: Record<string, any>, response: AxiosResponse) => {
  each(pick(request, ['lending_cost', 'structure_cost']), (value, key) => {
    update(key as keyof LendingInterface, value)
  })
  const { id, status } = response.data.deed_of_agreement
  emit('updated:deedOfAgreementId', { id, status })
}

const restore = () => {
  if (!lendingsList) { return }
  if (local.backup) {
    each(local.backup, (value, key) => {
      local.fields[key as keyof LendingInterface] = value
    })
  }
  exitEditing()
}

const remove = async () => {
  if (!lendingsList) { return }

  const { agreementId } = props
  const { id } = props.data

  if (!id && !agreementId) {
    return removeLending(lendingsList, props.indexes)
  }

  toggleLoading()

  const url = agreementMode.value
    ? `/agreements/${agreementId}`
    : `/lendings/${id}`

  const data = { lending_id: id }

  await $axios?.delete(url, {
    data
  })
    .then(() => {
      agreementMode.value
        ? removeAgreementRepsonseHandler()
        : removeRepsonseHandler()
    })
    .catch(console.error)

  toggleLoading()
}

const removeRepsonseHandler = () => {
  if (!lendingsList) { return }
  removeLending(lendingsList, props.indexes)
}

const removeAgreementRepsonseHandler = () => {
  update('structure_cost', '')
  update('selected', 0)
}

const showDocuments = () => {
  documents.show = true
}
</script>

<style lang="scss" scoped>
::v-deep .v-field--disabled {
  opacity: 1 !important;
  background-color: #f6f6f6;
}
::v-deep .lending-label,
::v-deep .lending-value {
  white-space: normal;
}
.row-odd {
  background-color: rgba(0,0,0,0.05);
}
</style>
