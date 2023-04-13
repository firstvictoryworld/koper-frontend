<template>
  <v-overlay v-bind:model-value="isLoading" :persistent="true" contained></v-overlay>

  <v-alert v-if="(!agreementData.id && !agreementData.status) || agreementData.status === AgreementStatusEnum.DRAFT_STRUCTURE || agreementData.status === AgreementStatusEnum.DRAFT_FONDO" type="warning">
    {{ draftMessage }}
  </v-alert>

  <Teleport v-if="component.mounted" to="#agreement-toolbar-target">
    <v-btn v-if="!!agreementData.id && showDelete" class="mr-3" size="large" color="red-accent-2" variant="plain" :loading="isDeleting" @click="() => remove()">
      {{ $t('delete') }}
    </v-btn>
    <v-btn v-if="showConfirm" class="mr-3" size="large" color="blue-accent-2" :loading="isProceding" @click="() => confirm()">
      {{ $t('proceed') }}
    </v-btn>
  </Teleport>

  <template v-if="agreementData.id">
    <v-alert v-if="agreementData.status === AgreementStatusEnum.CONSOLIDATED" type="warning">
      {{ $t('agreements.status.consolidated') }}
    </v-alert>
    <v-alert v-if="agreementData.status === AgreementStatusEnum.ACTIVE" type="success">
      {{ $t('agreements.status.active') }}
    </v-alert>
    <v-alert v-if="agreementData.status === AgreementStatusEnum.REJECTED" type="error">
      {{ $t('agreements.status.rejected') }}
    </v-alert>
    <v-alert v-if="agreementData.status === AgreementStatusEnum.CLOSED" type="error">
      {{ $t('agreements.status.closed') }}
    </v-alert>
  </template>

  <CardContainer
    v-if="agreementData.id && agreementData.status === AgreementStatusEnum.CONSOLIDATED && usersStore.isStruttura"
    class="mt-3"
    :title="$t('agreements.contract.title')"
  >
    {{ $t('agreements.contract.subtitle') }}
    <v-checkbox
      :label="$t('agreements.contract.checkbox')"
      hide-details="auto"
      color="koperniko-secondary"
      variant="outlined"
      :true-value="1"
      :false-value="0"
      density="compact"
      v-model="contract.accepted"
    />

    <v-btn :disabled="!contract.accepted" class="d-block ml-auto" size="large" color="koperniko-primary" :loading="isLoading" @click="() => subscribe()">
      {{ $t('confirm') }}
    </v-btn>
  </CardContainer>

  <template v-for="(lending, i) in lendings.list" :key="`lending-cat-${i}`">
    <LendingComponent
      :indexes="[i]"
      :agreement-id="agreementData.id"
      :readonly="readonly"
      v-bind:data="lendings.list[i]"
      @updated:deedOfAgreementId="data => updatedDeedOfAgreementId(data)"
    />
  </template>

	<ConfirmDialog
		  v-model:show="confirmDialogDetails.show"
		  v-model:title="confirmDialogDetails.title"
		  :message="$t('confirmDeleteMessage')"
			:rejectLabel="confirmDialogDetails.rejectLabel"
		  max-width="650"
			@confirm="confirmDelete"
			@cancel="cancelDelete"
		  />
</template>

<script setup lang="ts">
import AgreementStatusEnum from '@/enums/AgreementStatusEnum'
import UserTypes from '@/enums/UserTypesEnum'
import { useUsersStore } from '@/stores/users'
import { axiosInjectKey } from '@/utils/axios'
import { useToggle } from '@vueuse/shared'
import { each, find } from 'lodash'
import { computed, inject, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import CardContainer from '../common/CardContainer.vue'
import type { LendingInterface } from '../tariff/LendingComponent.vue'
import LendingComponent from '../tariff/LendingComponent.vue'
import { provideLendingsListObject, setupList, type LendingListInterface } from '../tariff/lendingLogic'
import ConfirmDialog from '../dialog/ConfirmDialog.vue'

const props = defineProps<{
  agreementId: null | number
}>()

const $axios = inject(axiosInjectKey)
const usersStore = useUsersStore()
const i18n = useI18n()

const lendings = reactive({ list: [], agreeded: [] } as LendingListInterface)

const agreementData = reactive({
  id: props.agreementId || 0,
  status: 0
})

const contract = reactive({
  accepted: 0,
})

const component = reactive({
  mounted: false
})

const confirmDialogDetails = reactive({
	show: false,
	title: '',
	message: '',
	rejectLabel: 'close'
})

provideLendingsListObject(lendings)

// Computed
const readonly = computed(() => {
  if (usersStore.isStruttura && !agreementData.id) { return false }
  if (usersStore.isStruttura && agreementData.status === AgreementStatusEnum.DRAFT_STRUCTURE) { return false }
  if (!usersStore.isStruttura && agreementData.status === AgreementStatusEnum.DRAFT_FONDO) { return false }
  return true
})

const showDelete = computed(() => {
	return agreementData.status != 0 && agreementData.status !== AgreementStatusEnum.ACTIVE && agreementData.status !== AgreementStatusEnum.REJECTED && agreementData.status !== AgreementStatusEnum.CLOSED
})

const showConfirm = computed(() => {
  return agreementData.status === AgreementStatusEnum.DRAFT_STRUCTURE
    || agreementData.status === AgreementStatusEnum.DRAFT_FONDO
})

const draftMessage = computed(() => {
  if (!agreementData.id && !agreementData.status) {
    return i18n.t('agreements.status.draft')
  }
  else if (agreementData.status === AgreementStatusEnum.DRAFT_STRUCTURE) {
    return usersStore.isStruttura ? i18n.t('agreements.status.draft') : i18n.t('agreements.status.waitingFondo')
  }
  else {
    return usersStore.isStruttura ? i18n.t('agreements.status.waitingStructure') : i18n.t('agreements.status.draft')
  }
})

// Events
const emit = defineEmits(['updated']);

// VueUse composables
const [isDeleting, toggleDelete] = useToggle(false)
const [isProceding, toggleProceed] = useToggle(false)
const [isLoading, toggleLoading] = useToggle(false)

// Functions

const updatedDeedOfAgreementId = ({ id, status }: any) => {
  agreementData.id = id
  agreementData.status = status
  emit('updated')
}

const subscribe = async () => {
  toggleLoading()

  await $axios?.put(`/agreements/${agreementData.id}/subscribe`)
    .then(({ data }) => {
      const { status } = data.agreement
      agreementData.status = status
      emit('updated')
    })
    .catch(console.error)

  toggleLoading()
}

const confirm = async () => {
  toggleProceed()

  await $axios?.put(`/agreements/${agreementData.id}/confirm`)
    .then(({ data }) => {
      const { status } = data.agreement
      agreementData.status = status
      emit('updated')
    })
    .catch(console.error)

  toggleProceed()
}

const remove = async () => {
  confirmDialogDetails.show = true;
}

const confirmDelete = async () => {
	confirmDialogDetails.show = false;

	toggleDelete()

	await $axios?.put(`/agreements/${agreementData.id}/reject`)
		.then(({ data }) => {
			const { status } = data.agreement
			agreementData.status = status
			emit('updated')
		})
		.catch(console.error)

	toggleDelete()
}

const cancelDelete = async () => {
	confirmDialogDetails.show = false;
}

const loadData = async () => {
  toggleLoading()

  agreementData.status = 0

  await $axios?.get(`/agreements/${agreementData.id || 'new'}`)
    .then(({ data }) => {
      lendings.list = setupList(data.lendings)
      agreementData.id = data.agreement?.id || 0
      agreementData.status = data.agreement?.status || 0
      injectAgreementValues(lendings.list)
    })
    .catch(console.error)

  toggleLoading()
}

const injectAgreementValues = (children: LendingInterface[]) => {
  each(children, child => {
    if (child.is_category) {
      return injectAgreementValues(child.children)
    }
    if (child.lending_agreements?.length) {
      child.selected = 1
      child.structure_cost = find(child.lending_agreements[0].current_lending_proposals, { user_type: UserTypes.STRUTTURA })?.lending_cost as number | undefined
      console.log(child);
      child.lending_cost = 
        find(child.lending_agreements[0].current_lending_proposals, { user_type: UserTypes.FONDO })?.lending_cost as number | undefined
        || child.lending_cost
    }
  })
}

onMounted(() => {
  loadData()
  component.mounted = true
})
</script>
