<template>
  <div class="sensor-card-item">
    <div class="sc-name">Tên: {{ row.name }}</div>
    <div class="sc-info">
      <div class="sc-info-item">
        <div class="inline-block">
          Điểm đo :
          <ElTag v-for="item in row.cameraMonitorPoints" class="m-2" :key="item.id" type="success" effect="dark">
            {{ item.name }}
          </ElTag>
        </div>
      </div>
    </div>
    <div class="sc-actions">
      <button class="action-btn-circle btn-edit-round" @click="() => $emit('edit', row)">✎</button>
      <button class="action-btn-circle btn-delete-round" @click="() => $emit('delete', row)">🗑</button>
    </div>
  </div>
</template>

<script setup lang="ts">

import {TableColumn} from "@/components/Table/TableCard.vue";
import { ElTag } from 'element-plus'

type RowData = any
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

</script>