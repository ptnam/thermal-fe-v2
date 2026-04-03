<template>
  <div class="sensor-card-item">
    <div class="sc-header">
      <span class="sc-id">{{row.dateData}} {{ row.timeData}}</span>
      <span class="status-badge status-good">------</span>
    </div>
    <div class="sc-name">{{row.machineName}} - {{ row.machineComponentName}}</div>
    <div class="sc-info">
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        {{ row.areaName}}
      </div>
      <div class="sc-info-item">
        <svg style="width:14px; height:14px; margin-right:4px; vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
        </svg>
        Nhiệt độ: <strong style="color:var(--primary); font-size:16px">------°C</strong>
      </div>

      <div style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--text-sub); margin-bottom: 8px; text-transform: uppercase;">
          So sánh chi tiết</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div v-for="itemVa in row.dicThermalDataResults" style="background: rgba(255,255,255,0.02); padding: 8px; border-radius: 4px; display: flex; flex-direction: column;">
            <div style="color: var(--text-sub); font-size: 10px;">{{itemVa?.compareTypeObject?.name}}</div>
            <div style="font-weight: 600;">{{itemVa?.compareValue}} °C ({{ itemVa?.deltaValue}})</div>
            <div style="font-size: 10px; margin-top: 2px; visibility: hidden;">SS:
              Placeholder</div>
            <div
              class="status-badge"
              :style="{
    backgroundColor: STATUS_COLOR_MAP[itemVa?.compareResultObject?.code],
    minWidth: 'unset',
    width: '100%',
    borderRadius: '2px',
    marginTop: 'auto',
    fontSize: '9px',
    padding: '2px 0'
  }"
                >
              {{itemVa?.compareResultObject?.name}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STATUS_COLOR_MAP } from '@/constants'
import {TableColumn} from "@/components/Table/TableCard.vue";

type RowData = Record<string, unknown>
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

</script>