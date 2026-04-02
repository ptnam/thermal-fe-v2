<template>
  <div class="sensor-card-item">
    <div class="sc-header">
      <span class="sc-id">{{ row.code }}</span>
      <span
          :style="{color: row.status === 'Active' ? 'var(--success)' : 'var(--danger)', fontSize: '12px'}">● {{ row.displayStatus }}</span>
    </div>
    <div class="sc-info">
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        Kênh: {{ row.name}}
      </div>
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        Sự kiện: {{ joinFieldValues(row?.events, 'name') }}
      </div>
    </div>
    <div class="sc-actions">
      <button class="action-btn-circle btn-edit-round" @click="() => $emit('edit', {row:row})">✎</button>
      <button class="action-btn-circle btn-delete-round" @click="() => $emit('delete', {row:row})">🗑</button>
    </div>
  </div>
</template>

<script setup lang="ts">

import {TableColumn} from "@/components/Table/TableCard.vue";
import {joinFieldValues} from "@/utils/stringUtils";

type RowData = Record<string, unknown>
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

</script>