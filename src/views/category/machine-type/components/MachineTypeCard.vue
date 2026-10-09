<template>
  <div class="sensor-card-item">
    <div class="sc-header">
      <div class="sc-id">{{ row.code }}</div>
      <span class="status-badge"
            :style="{color: row.status === 'Active' ? 'var(--success)' : 'var(--danger)', fontSize: '12px'}">{{
          row?.statusObject?.name
        }}</span>
    </div>
    <div class="sc-name">{{ row.name }}</div>
    <div class="sc-info">
      <div class="sc-info-item">📅 {{ row.createdAt }}</div>
    </div>
    <div class="sc-actions">
      <button class="btn-add" @click="() => $emit('addMachinePart',{row:row} )"
              style="padding: 4px 12px; font-size: 11px;">+ {{ t('machineType.parts') }}
      </button>
      <button class="action-btn-circle btn-edit-round" @click="() => $emit('edit', {row:row})">✎</button>
      <button class="action-btn-circle btn-delete-round" @click="() => $emit('delete', {row:row})">🗑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'

import {TableColumn} from "@/components/Table/TableCard.vue";

const { t } = useLang()

type RowData = any
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

</script>