<template>
  <div class="sensor-card-item">
    <div class="sc-header"><span class="sc-id">{{row?.name}}</span>
      <span :style="{color: row.status === 'Active' ? 'var(--success)' : 'var(--danger)', fontSize: '12px'}">● {{ enumLabel('commonStatusList', row.status, row.displayStatus) }}</span>
    </div>
    <div class="sc-name">{{ row.code }}</div>
    <div class="sc-info">
      <div class="sc-info-item">🗺️ {{ t('fields.type') }}: {{ row?.mapTypeObject?.['name'] }}</div>
      <div v-show="row.note" class="sc-info-item">📝 {{row.note}}</div>
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

const { t } = useLang()

type RowData = Record<string, unknown>
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

</script>