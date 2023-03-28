<template>
  <v-container>
    <PageDescription
      :title="$t('agreementDeed.title')"
      :subtitle="$t('agreementDeed.subtitle')"
    />

    <AgreementDeedDocumentComponent v-if="userStore.isStructureOrUser"/>
    <StructureStatusListComponent v-else/>
   
  </v-container>
</template>


<script setup lang="ts">
import { useUsersStore } from '@/stores/users'
import PageDescription from '@/components/common/PageDescription.vue'
import AgreementDeedDocumentComponent from '@/components/agreement-deeds/AgreementDeedDocumentComponent.vue'
import StructureStatusListComponent from '@/components/agreement-deeds/StructureStatusListComponent.vue';

const userStore = useUsersStore()

</script>