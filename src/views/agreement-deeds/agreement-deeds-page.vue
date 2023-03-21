<template>
  <v-container>
    <PageDescription
      :title="$t('agreementDeed.title')"
      :subtitle="$t('agreementDeed.subtitle')"
    />
    <AgreementDeedDocumentComponent/>
   
  </v-container>
</template>


<script setup lang="ts">
import PageDescription from '@/components/common/PageDescription.vue'
import AgreementDeedDocumentComponent from '@/components/agreement-deeds/AgreementDeedDocumentComponent.vue'


</script>