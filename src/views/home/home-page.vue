<template>
  <v-container>
    <PageDescription
      :title="$t('home.title')"
      :subtitle="usersStore.isStruttura || usersStore.isUtente? subtitleStructure : subtitle"
    />
    <!--
    <card-container v-if="usersStore.isStruttura || usersStore.isUtente">
      <h4>Si prega di completatare la seguente bullet list</h4><br/>
      <ul class="ml-3"> 
        <li><a href="/structure-registry">Aggiorna i dati anagrafici</a></li>
      
        <li><a href="/structure-registry">Aggiorna i dati bancari</a></li>
      
        <li><a href="/agreement-deeds">Sottoscrivi l'atto di convenzionamento</a></li>
    
      </ul>
    </card-container>
    -->

    <AdminPage v-if="usersStore.isAdmin" />
    
    <StrutturaPage v-else />
  </v-container>
</template>

<script setup lang="ts">
import AdminPage from './admin-page.vue'
import CardContainer from '@/components/common/CardContainer.vue'
import StrutturaPage from './struttura-page.vue'
import { useUsersStore } from '@/stores/users'
import PageDescription from '@/components/common/PageDescription.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Stores
const usersStore = useUsersStore()
const i18n = useI18n()

// Computed
const subtitle = computed(() =>
  i18n.t('home.subtitle')
    .replace(':name', usersStore?.userDetails?.name || '')
    .replace(':surname', usersStore?.userDetails?.surname || '')
)

const subtitleStructure = computed(() =>
  i18n.t('home.subtitleStructure')
    .replace(':business_name', usersStore?.userDetails?.structureBusinessName || '')
    .replace(':code', usersStore?.userDetails?.structureCode || '')
)

</script>
