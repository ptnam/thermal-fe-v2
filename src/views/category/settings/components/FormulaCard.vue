<template>
  <div class="sensor-card-item">
    <div class="sc-header">
      <span class="sc-id">{{ row.name }}</span>
      <span :style="{ color: row.status === 1 ? 'var(--success)' : 'var(--text-sub)', fontSize: '12px' }">
        ● {{ row.status === 1 ? 'Hoạt động' : 'Không hoạt động' }}
      </span>
    </div>
    <div class="sc-name">{{ row.code }}</div>
    <div class="sc-info">
      <div class="sc-info-item">ƒx {{ row.expression }}</div>
      <div v-show="row.description" class="sc-info-item">📝 {{ row.description }}</div>
      <div class="sc-info-item">📌 {{ scopeLabel(row) }}</div>
    </div>
    <div class="sc-actions">
      <button class="action-btn-circle btn-edit-round" @click="() => $emit('edit', { row })">✎</button>
      <button
          class="action-btn-circle btn-delete-round"
          :disabled="row.isLocked || row.inUse"
          @click="() => $emit('delete', { row })"
      >🗑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@/components/Table/TableCard.vue'

type RowData = Record<string, any>
defineProps<{ row: RowData; columns: TableColumn[]; index: number; loading: boolean }>()
defineEmits(['edit', 'delete'])

function scopeLabel(row: RowData) {
  const parts: string[] = []
  if (row.componentAssignmentCount) parts.push(`${row.componentAssignmentCount} bộ phận`)
  if (row.partAssignmentCount) parts.push(`${row.partAssignmentCount} loại bộ phận`)
  return parts.length ? parts.join(' · ') : 'Chưa gán'
}
</script>
