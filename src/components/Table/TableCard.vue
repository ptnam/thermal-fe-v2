<template>
  <div v-if="loading && !data.length" class="table-card__loading">
    <slot name="loading">Loading...</slot>
  </div>

  <div v-else-if="!data.length" class="table-card__empty">
    <slot name="empty">No data</slot>
  </div>

  <template v-else>
    <component
      v-for="(row, index) in data"
      :is="cardComponent"
      :key="resolveRowKey(row, index)"
      :row="row"
      :columns="columns"
      :index="index"
      :loading="loading"
      v-bind="$attrs"
    />
  </template>
</template>

<script setup lang="ts">
import { type Component } from 'vue'

export interface TableColumn {
  prop: string
  label?: string
  field?: string
  [key: string]: unknown
}

type RowData = Record<string, unknown>

interface Props {
  cardComponent: Component | string
  columns?: TableColumn[]
  data: RowData[]
  loading?: boolean
  rowKey?: any
  cardProps?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  loading: false,
  rowKey: 'id',
  cardProps: () => ({}),
})

function resolveRowKey(row: RowData, index: number) {
  const value = row?.[props.rowKey]

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol'
  ) {
    return value
  }

  return index
}
</script>

<style scoped>
.table-card__loading,
.table-card__empty {
  padding: 16px;
  text-align: center;
}
</style>