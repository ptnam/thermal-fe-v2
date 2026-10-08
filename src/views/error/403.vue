<!-- src/views/error/403.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md text-center">
      <h1 class="text-7xl font-bold text-red-600">403</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mt-4">{{ t('error.forbiddenTitle') }}</h2>
      <p class="text-gray-600 mt-2">
        {{ t('error.forbiddenDesc') }}
      </p>
      <router-link
        to="/dashboard"
        class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
        {{ t('error.returnToHome') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'

const { t } = useLang()
</script>
