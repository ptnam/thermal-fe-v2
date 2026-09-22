<template>
  <div class="sensor-card-item">
    <div class="sc-header">
      <span class="sc-id">{{ row.formattedDate}}</span>
      <span class="status-badge status-danger">{{ row?.compareResultObject?.name}}</span>
    </div>
    <div class="sc-name">{{row.machineName}}-{{row.machineComponentName}}</div>
    <div class="sc-info">
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        Thiết bị: <strong>{{row.machineName}}</strong>
      </div>
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        Cường độ PĐ: <strong style="color:var(--danger); font-size:16px">{{row.componentValue}} dB</strong>
      </div>
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        Camera: {{row.cameraCode}} · Vùng: {{row.zoneName || '—'}}
      </div>
      <div  class="sc-info-item" style="margin-top: 10px; font-size: 11px; color: var(--text-sub); border-top: 1px solid var(--border); padding-top: 8px;">
        <svg style="width:12px; height:12px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        {{ row.areaName}}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {TableColumn} from "@/components/Table/TableCard.vue";

type RowData = any
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()
</script>
