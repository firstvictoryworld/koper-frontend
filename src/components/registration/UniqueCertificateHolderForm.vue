<template>
	<card-container :title="$t('registration.bankAccount.unique_certificate_holder_title')">
		<v-row>
			<v-col v-for="key in keys" :key="key" cols="12" md="4">
				<v-text-field v-bind:model-value="data[key]" hide-details="auto" color="koperniko-secondary"
					variant="outlined" :type="key == 'unique_certificate_holder_birth_date' ? 'date' : 'text'" :label="$t(`registration.bankAccount.${key}`)"
					:rules="fieldRules[key] || []"
					@update:modelValue="(value: string) => $emit('update:data', { ...data, [key]: value })"
					:disabled="!!props.readonly" />
			</v-col>
		</v-row>
	</card-container>
</template>

<script setup lang="ts">
import CardContainer from '@/components/common/CardContainer.vue'
import { codFiscaleOrPivaValidation, requiredValidation, type ValidationRule } from '@/validation/rules';
import { computed } from 'vue';

interface RecordInterface {
	unique_certificate_holder_name: string
	unique_certificate_holder_surname: string
	unique_certificate_holder_fiscal_code: string
	unique_certificate_holder_birth_place: string
	unique_certificate_holder_birth_date: string
}

interface Props {
	data: RecordInterface
	readonly?: boolean
}

const props = defineProps<Props>()
const keys = computed(() => Object.keys(props.data) as (keyof RecordInterface)[])

const fieldRules: Record<keyof RecordInterface, ValidationRule[]> = {
	unique_certificate_holder_name: [],
	unique_certificate_holder_surname: [],
	unique_certificate_holder_fiscal_code: [codFiscaleOrPivaValidation],
	unique_certificate_holder_birth_place: [],
	unique_certificate_holder_birth_date: [],
}
</script>
