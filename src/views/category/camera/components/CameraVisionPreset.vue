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
    <base-table
        :columns="columns"
        :data="tableData"
        :loading="isLoading"
    ></base-table>
  </div>
</template>
<script setup lang="ts">
import {getAllCamerasApi, getVisionPresetsApi} from "@/api/camera";
import VirtualizedSelectFromUrl from "@/components/Selection/VirtualizedSelectFromUrl.vue";
import {computed, ref} from "vue";
import {TableColumn} from "@/components/Table";
import BaseTable from "../../../../components/Table/BaseTable.vue";

const props = defineProps({
  visionCamera: {
    type: Object,
  },
})

const presetCameraId = ref(null)

const columns = computed<TableColumn[]>(() => [
  {type: 'index', label: 'STT', width: 60, headerAlign: 'center'},
  {prop: 'code', label: 'Mã camera'},
  {prop: 'name', label: 'Tên camera'},
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
</script>