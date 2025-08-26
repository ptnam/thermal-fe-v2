<script setup lang="tsx">
import PageContainer from '@/components/PageContainer.vue'
import RemoteTable from "@/components/Table/RemoteTable.vue";
import {ElCard} from "element-plus";
import {getLastestNotificationApi} from "@/api/notification";
import TemperatureLog from "@/views/event/components/TemperatureLog.vue";
import ThresholdWarning from "@/views/event/components/ThresholdWarning.vue";

const warningCols = [
  {type: "index", label: 'STT', align: 'center', width: "60px"},
  {prop: 'dateData', label: 'Ngày'},
  {prop: 'timeData', label: 'Thời gian'},
  {prop: 'areaName', label: 'Khu vực'},
  {prop: 'machineComponentName', label: 'Bộ phận'},
  {prop: 'componentValue', label: 'Nhiệt độ', align: 'center', width: 120},
  {prop: 'compareTypeObject.name', label: 'Loại so sánh'},
  {prop: 'compareValue', label: 'Giá trị so sánh', align: 'center', width: 80},
  {prop: 'deltaValue', label: 'Độ lệch', align: 'center', width: 80},
  {prop: 'statusObject.name', label: 'Trạng thái'},
]
</script>

<template>
  <page-container title="Tổng hợp dữ liệu">
    <el-card>
      <template v-slot:header>Nhật ký nhiệt độ theo điểm đo</template>
      <template v-slot:default>
        <TemperatureLog></TemperatureLog>
      </template>
    </el-card>
    <div class="mt-4">
      <el-card>
        <template v-slot:header>10 cảnh báo vượt ngưỡng gần nhất</template>
        <template v-slot:default>
          <remote-table
              :request-fn="() =>getLastestNotificationApi({ numberOfRecord: 10 })"
              :columns="warningCols"
          />
        </template>
      </el-card>
    </div>
    <div class="mt-4">
      <el-card>
        <template v-slot:header>Tổng số cảnh báo vượt ngưỡng</template>
        <template v-slot:default>
          <ThresholdWarning></ThresholdWarning>
        </template>
      </el-card>
    </div>
  </page-container>
</template>