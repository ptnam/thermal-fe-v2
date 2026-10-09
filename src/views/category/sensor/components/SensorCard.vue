<template>
  <div class="sensor-card-item">
    <div class="sc-header"><span class="sc-id">{{row.code}}</span>
      <span :style="{color: row.status === 'Active' ? 'var(--success)' : 'var(--danger)', fontSize: '12px'}">● {{ enumLabel('commonStatusList', row.status, row.displayStatus) }}</span>
    </div>
    <div class="sc-name">{{row.name}}</div>
    <div class="sc-info">
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        {{ row?.area?.name }}
      </div>
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
        </svg>
        {{row.temperature ?? '--'}} °C
      </div>
    </div>
    <div class="sc-actions">
      <button class="action-btn-circle btn-edit-round" @click="() => emits('edit', {row:row})">✎</button>
      <button class="action-btn-circle btn-delete-round" @click="() => emits('delete', {row:row})">🗑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { enumLabel } from '@/utils/enumLabel'
import type { TableColumn } from '@/components/Table/TableCard.vue'

type RowData = any
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

const emits = defineEmits(['edit', 'delete'])

</script>