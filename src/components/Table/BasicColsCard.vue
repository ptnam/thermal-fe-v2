<template>
  <div>
    <div v-for="col in columns" :key="col.prop">
      <strong>{{ col.label ?? col.prop }}:</strong>
      <span>{{ row[col.prop] }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from './TableCard.vue'

type RowData = Record<string, unknown>

defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()
</script>