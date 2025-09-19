<template>
  <div>
    <el-form-item label="Camera tích hợp">
      <virtualized-select-from-url
          ref="cameraRef"
          v-model="presetCameraId"
          :request-fn="() => getAllCamerasApi({ areaId: visionCamera?.areaId })"
          filterable
          value-key="id"
          clearable
          @change="refreshTable"
      />
    </el-form-item>
    <div>
      <base-table
          :columns="columns"
          :data="tableData"
          :loading="isLoading"
      ></base-table>
      <SimpleDrawRTCPlayer ref="rtcPlayerRef"  v-if="presetCameraId" :stream-key="presetCameraId" />
    </div>

  </div>
</template>
<script setup lang="tsx">
import {getAllCamerasApi, getVisionPresetsApi} from "@/api/camera";
import VirtualizedSelectFromUrl from "@/components/Selection/VirtualizedSelectFromUrl.vue";
import {computed, ref} from "vue";
import {TableColumn} from "@/components/Table";
import BaseTable from "../../../../components/Table/BaseTable.vue";
import {View, EditPen} from "@element-plus/icons-vue";
import SimpleDrawRTCPlayer from "@/components/Video/SimpleDrawRTCPlayer.vue";
import {ElButton, ElTooltip} from 'element-plus'

const props = defineProps({
  visionCamera: {
    type: [Object, null],
    required: false
  },
})

const presetCameraId = ref(null)

const columns = computed<TableColumn[]>(() => [
  {prop: 'presetName', label: 'Presets'},
  {
    label: 'Vẽ vùng',
    align: 'center',
    slots: {
      default: (scope: any) => (
          <ElTooltip content='Vẽ vùng'>
            <ElButton
                circle={true}
                icon={EditPen}
                onClick={() => drawArea(scope.row)}
            />
          </ElTooltip>
      ),
    },
  },
  {
    label: 'Xem ảnh',
    align: 'center',
    slots: {
      default: (scope: any) => (
          <ElTooltip content='Xem ảnh'>
            <ElButton
                circle={true}
                icon={View}
                onClick={() => viewImage(scope.row)}
            />
          </ElTooltip>
      ),
    },
  }
]);

const tableData = ref([])
const isLoading = ref(false)
const refreshTable = () => {
  isLoading.value = true
  getVisionPresetsApi({
    cameraId: props.visionCamera?.id,
    presetCameraId: presetCameraId.value
  }).then(res => {
    tableData.value = res.data
  }).finally(() => {
    isLoading.value = false
  })
}

const drawArea = (_row) => {

}

const rtcPlayerRef = ref()
const viewImage = (_row) => {
  rtcPlayerRef.value?.()
}
</script>