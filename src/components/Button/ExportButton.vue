<template>
  <el-button class="btn-search" v-bind="$attrs" style="background: var(--success); border: none;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    {{ t('common.exportFile') }}
  </el-button>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'

const { t } = useLang()
</script>
