<template>
	<th :key="`th-${col.key}`" :class="col.class" v-bind="col.colProps">
		<div v-outsideClick="outsideClickHandler" ref="filterContainerRef" style="position: relative">
			<div :style="thWrapperStyle">
				<span v-if="!(col.key == 'checkbox')">{{ col.label !== undefined ? col.label : $t(`${localPrefix}${col.key}`) }}</span>
				<slot v-else :name="`col-${col.key}`"></slot>
				<div v-if="col.enableFilter">
					<v-icon size="15" color="#aaa" @click="toggleFilter">mdi-filter-outline</v-icon>
				</div>
			</div>
			<div v-if="col.enableFilter && openFilter" :style="filterDropStyle">
				<v-card class="mx-auto" width="180" variant="elevated" :style="filterCardStyle">
					<v-card-item>
						<div>
							<div v-for="option of col.filterOptions">
								<v-checkbox hide-details="auto" color="indigo-darken-3" density="compact" :label="option.label"
									:value="option.value" v-model="selectedFilterValues" />
							</div>
						</div>
					</v-card-item>

					<v-card-actions style="padding: 0.625rem 1rem">
						<v-btn :size="'small'" @click="onClickResetFilter">
							Reset
						</v-btn>
						<div></div>
						<v-btn :size="'small'" @click="onClickApplyFilter">
							{{ $t('apply') }}
						</v-btn>
					</v-card-actions>
				</v-card>
			</div>
		</div>
	</th>
</template>
<script setup lang="ts">
import type { DatatableColInterface } from '@/@types';
import { reactive, ref, watch, onMounted } from 'vue';

interface Props {
	localPrefix?: string,
	col: DatatableColInterface
}

const props = withDefaults(defineProps<Props>(), {
	localPrefix: 'table.',
})

const thWrapperStyle = reactive({ width: '100%', display: 'flex' })
const filterDropStyle = reactive({
	position: 'absolute',
	top: '32px',
	right: 0,
	minWidth: '100px',
	zIndex: 99
})
const filterCardStyle = reactive({
	border: '1px solid #ede2e2d1',
	borderRadius: '0'
})

const selectedFilterValues = ref([])
const filterContainerRef = ref(null)
const openFilter = ref(false)

const emit = defineEmits(['filterApply'])

/// handlers
const toggleFilter = () => openFilter.value = !openFilter.value;

const outsideClickHandler = () => {
	if (openFilter.value) {
		openFilter.value = !openFilter.value;
	}
};

const onClickApplyFilter = () => {
	toggleFilter()
	
	emit('filterApply', {
		key: props.col.key,
		values: selectedFilterValues.value
	});
}

const onClickResetFilter = () => {
	selectedFilterValues.value = [];
}
</script>