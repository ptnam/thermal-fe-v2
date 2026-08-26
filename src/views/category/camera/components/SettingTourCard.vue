<template>
  <div class="sensor-card-item">
    <div class="sc-name">Tên: {{ row.name }}</div>
    <div class="sc-info">
      <div class="sc-info-item">
        <div class="inline-block">
          Góc quay :
          <ElTag v-for="item in row.cameraTourPresets" class="m-2" :key="item.id" type="success" effect="dark">
            {{ item.name }}({{ item.stayTime }})
          </ElTag>
        </div>
      </div>
    </div>
    <div class="sc-actions">
      <ApiButton
        :api="() => playTourApi({
        tourId: row.tourId,
        cameraId: row.cameraId,
        command: 'run'
      }).then(res => showMessage(res))"
        :icon="ArrowRight"
        color="#4F6B99"
        class="!m-0 action-btn-circle btn-edit-round"
      />

      <ApiButton
        :api="() => playTourApi({
        tourId: row.tourId,
        cameraId: row.cameraId,
        command: 'stop'
      }).then(res => showMessage(res))"
        :icon="SwitchButton"
        color="#FACE38"
        class="!m-0 action-btn-circle btn-edit-round"
      />
      <button class="!m-0 action-btn-circle btn-edit-round" @click="() => $emit('edit', row)">✎</button>
      <button class=" !m-0 action-btn-circle btn-delete-round" @click="() => $emit('delete', row)">🗑</button>
    </div>
  </div>
</template>

<script setup lang="ts">

import {TableColumn} from "@/components/Table/TableCard.vue";
import { ElMessage, ElTag } from 'element-plus'
import ApiButton from '@/components/Button/ApiButton.vue'
import { playTourApi } from '@/api/camera'
import { ArrowRight, SwitchButton } from '@element-plus/icons-vue'

type RowData = any
defineProps<{
  row: RowData
  columns: TableColumn[]
  index: number
  loading: boolean
}>()

const showMessage = (res: any) => {
  ElMessage({
    message: res.message,
    type: 'success',
  })
}
</script>