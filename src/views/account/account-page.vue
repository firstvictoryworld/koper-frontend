<template>
  <v-container>
    <PageDescription
      :title="$t('account.title')"
      :subtitle="$t('account.subtitle')"
    />

    <v-alert v-if="usersStore.structureNotApproved" dense type="error" class="mt-5">
      {{ $t('account.notApprovedAlert') }}
    </v-alert>

    <v-alert v-else-if="usersStore.structureRejected" dense type="warning" class="mt-5">
      {{ $t('account.rejectedApprovedAlert') }}
    </v-alert>

    <v-alert v-else-if="usersStore.structureNotCompleted" dense type="warning" class="mt-5">
      {{ $t('account.notCompletedApprovedAlert') }}
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
        <v-tab value="user">{{ $t('account.tabs.user') }}</v-tab>
        <v-tab value="password">{{ $t('account.tabs.changePassword') }}</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tabs.value" class="pt-1">
          <v-window-item value="user">
            <UserProfile />
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
import UserProfile from '@/components/account/UserProfile.vue'
import PasswordModify from '@/components/account/PasswordModify.vue'
import PageDescription from '@/components/common/PageDescription.vue'
import { reactive } from 'vue'

// Variables
const tabs = reactive({ value: 'user' })

// Stores
const usersStore = useUsersStore()

</script>
