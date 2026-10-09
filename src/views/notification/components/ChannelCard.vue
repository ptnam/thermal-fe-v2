<template>
  <div class="sensor-card-item">
    <div class="sc-header">
      <span class="sc-id">ID: {{ row.id }}</span>
      <span
          :style="{color: row.status === 'Active' ? 'var(--success)' : 'var(--danger)', fontSize: '12px'}">● {{ enumLabel('notificationChannelStatusList', row.status, row.displayStatus) }}</span>
    </div>
    <div class="sc-name">{{ row.name }}</div>
    <div class="sc-info">
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        {{ t('fields.type') }}: {{ row.channelType }}
      </div>
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        ND: {{ joinFieldValues(row?.users as [], 'firstName') }}
      </div>
      <div class="sc-info-item" style="font-size: 11px; color: var(--text-sub); margin-top: 8px;">
        <svg style="width:12px; height:12px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {{ row.createdAt }}
      </div>
    </div>
    <div class="sc-actions">
      <button class="action-btn-circle btn-edit-round" @click="() => $emit('edit', {row:row})">✎</button>
      <button class="action-btn-circle btn-delete-round" @click="() => $emit('delete', {row:row})">🗑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { enumLabel } from '@/utils/enumLabel'
import { useLang } from '@/hooks/web/useI18n'

import {TableColumn} from "@/components/Table/TableCard.vue";
import {joinFieldValues} from "@/utils/stringUtils";

const { t } = useLang()

type RowData = Record<string, unknown>
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

</script>