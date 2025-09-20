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
    <div class="flex">
      <base-table
          v-show="tableVisible"
          :columns="columns"
          :data="tableData"
          :loading="isLoading"
      ></base-table>
      <el-image-viewer
          v-if="viewerVisible"
          :url-list="viewerImages"
          :initial-index="startIndex"
          @onClose="viewerVisible = false"
      />
      <SimpleDrawRTCPlayer
          ref="rtcPlayerRef"
          :key="presetCameraId"
          v-if="presetCameraId"
          :stream-key="presetCameraId"
      />
    </div>

  </div>
</template>
<script setup lang="tsx">
import {getAllCamerasApi, getVisionPresetsApi} from "@/api/camera";
import VirtualizedSelectFromUrl from "@/components/Selection/VirtualizedSelectFromUrl.vue";
import {computed, nextTick, onMounted, ref} from "vue";
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
const tableVisible = ref(true)

onMounted(() => {
  presetCameraId.value = props.visionCamera?.id
  if (props.visionCamera?.ptzType === 'Fix') {
    tableVisible.value = false
    nextTick(() => {
      setTimeout(function () {
        drawArea({presetId: 0})
      }, 1000)
    })
  } else {
    refreshTable()
  }
})

const columns = computed<TableColumn[]>(() => [
  {prop: 'presetName', label: 'Presets'},
  {
    label: 'Vẽ vùng',
    align: 'center',
    width: '120px',
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
    width: '120px',
    slots: {
      default: (scope: any) => (
          scope.row.imagePath ? (
              <ElTooltip content="Xem ảnh">
                <ElButton
                    circle={true}
                    icon={View}
                    onClick={() => viewImage(scope.row)}
                />
              </ElTooltip>
          ) : <></>
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


const rtcPlayerRef = ref()
const drawArea = (row: any) => {
  rtcPlayerRef.value?.toggleFullScreen();
  rtcPlayerRef.value?.startDrawing();
  rtcPlayerRef.value?.setPresetData({
    cameraId: props.visionCamera?.id,
    presetCameraId: presetCameraId.value,
    presetId: row.presetId
  });
}

const viewerVisible = ref(false);
const viewerImages = ref<string[]>([]);
const startIndex = ref(0);

const viewImage = (row: any) => {
  viewerImages.value = [row.imagePath]; // if multiple images per row, map them into an array
  startIndex.value = 0;
  viewerVisible.value = true;
}
</script>