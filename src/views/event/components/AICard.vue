<template>
  <div class="sensor-card-item">
    <div class="sc-header"><span class="sc-id">{{ row.dateData}}</span><span style="color:var(--danger); font-size:12px">● Alert</span></div>
    <div class="sc-img-wrap">
      <ElImage
        :src="row.imagePath"
        :lazy="true"
        fit="cover"
        :preview-src-list="[row.imagePath]"
        :show-progress="true"
        :preview-teleported="true"
      />
      <img :src="row.imagePath" class="sc-img" alt="AI Event">
    </div>
    <div class="sc-name">{{ row.warningEventName}}</div>
    <div class="sc-info">
      <div class="sc-info-item">🕒 {{ row.timeData}}</div>
      <div class="sc-info-item">📍 {{row.areaName}}</div>
      <div class="sc-info-item">🎥 {{ row.cameraName}}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {TableColumn} from "@/components/Table/TableCard.vue";
import { ElImage } from 'element-plus'

type RowData = any
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

</script>