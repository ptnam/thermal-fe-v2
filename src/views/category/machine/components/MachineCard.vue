<template>
  <div class="sensor-card-item">

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

const emits = defineEmits("edit", "delete")

</script>