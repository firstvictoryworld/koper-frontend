<template>
  <v-container>
    <PageDescription
      :title="$t('registry.title')"
      :subtitle="$t('registry.subtitle')"
    />

    <v-alert v-if="usersStore.structureNotApproved" dense type="error" class="mt-5">
      {{ $t('registry.notApprovedAlert') }}
    </v-alert>

    <v-alert v-else-if="usersStore.structureRejected" dense type="warning" class="mt-5">
      {{ $t('registry.rejectedApprovedAlert') }}
    </v-alert>

    <v-alert v-else-if="usersStore.structureNotCompleted" dense type="warning" class="mt-5">
      {{ $t('registry.notCompletedApprovedAlert') }}
      <div class="mt-3">
        <v-btn variant="flat" color="koperniko-primary" to="/">
          {{ $t('complete') }}
        </v-btn>
      </div>
    </v-alert>

    <v-card class="mt-5" :rounded="50">
      <v-tabs
        v-model="tabs.value"
        bg-color="koperniko-primary"
        center-active
        show-arrows
      >
        <v-tab v-if="usersStore.isStruttura && usersStore.structureCompleted" value="structure">{{ $t('registry.tabs.structure') }}</v-tab>
        <v-tab v-if="usersStore.isStruttura && usersStore.structureCompleted" value="users">{{ $t('registry.tabs.users') }}</v-tab>
        <v-tab v-if="usersStore.isStruttura && usersStore.structureCompleted" value="bank">{{ $t('registry.tabs.bankAccount') }}</v-tab>
        <v-tab v-if="usersStore.isStruttura && usersStore.structureCompleted" value="contacts">{{ $t('registry.tabs.contacts') }}</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tabs.value" class="pt-1">

          <v-window-item v-if="usersStore.isStruttura" value="structure">
            <StructureDetails />
          </v-window-item>

          <v-window-item value="users">
            <StructureUsers />
          </v-window-item>

          <v-window-item v-if="usersStore.isStruttura" value="bank">
            <BankAccount />
          </v-window-item>

          <v-window-item v-if="usersStore.isStruttura" value="contacts">
            <StructureContacts />
          </v-window-item>

          <v-window-item value="password">
            <PasswordModify />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users'
import StructureDetails from '@/components/structure-registry/StructureDetails.vue'
import StructureUsers from '@/components/structure-registry/StructureUsers.vue'
import StructureContacts from '@/components/structure-registry/StructureContacts.vue'
import BankAccount from '@/components/structure-registry/BankAccount.vue'
import PageDescription from '@/components/common/PageDescription.vue'
import { reactive } from 'vue'

// Variables
const tabs = reactive({ value: 'user' })

// Stores
const usersStore = useUsersStore()

</script>
