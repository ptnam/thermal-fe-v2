<template>
  <div>
    <el-form-item label="Camera tích hợp">
      <select-options
          ref="cameraRef"
          v-model="cameraTmp"
          filterable
          value-key="id"
          clearable
          @change="refreshTable"
          :options="[visionCamera, visionCamera?.integratedCam]"
      >
      </select-options>
    </el-form-item>
    <div class="flex">
      <div class="w-[320px]">

        <base-table
            :columns="columns"
            :data="tableData"
            :loading="isLoading"
        ></base-table>
      </div>
      <SimpleDrawRTCPlayer
          ref="rtcPlayerRef"
          v-if="presetCameraId"
          :key="presetCameraId"
          :stream-key="presetCameraId"
          @saved="() => refreshTable()"
      />
    </div>

    <el-image-viewer
        v-if="viewerVisible"
        :url-list="viewerImages"
        :initial-index="startIndex"
        @close="viewerVisible = false"
    />

  </div>
</template>
<script setup lang="tsx">
import {getVisionPresetsApi, invokePresetApi} from "@/api/camera";
import {computed, onMounted, ref} from "vue";
import {TableColumn} from "@/components/Table";
import BaseTable from "../../../../components/Table/BaseTable.vue";
import {View, EditPen} from "@element-plus/icons-vue";
import SimpleDrawRTCPlayer from "@/components/Video/SimpleDrawRTCPlayer.vue";
import {ElButton, ElTooltip} from 'element-plus'
import SelectOptions from "@/components/Selection/SelectOptions.vue";
import ApiButton from "@/components/Button/ApiButton.vue";

const props = defineProps({
  visionCamera: {
    type: [Object, null],
    required: false
  },
})

const cameraTmp = ref(null)
const presetCameraId = ref(null)

onMounted(() => {
  presetCameraId.value = props.visionCamera?.id
  cameraTmp.value = props.visionCamera?.id
  refreshTable()
})

const columns = computed<TableColumn[]>(() => [
  {prop: 'presetName', label: 'Presets', width: '80px',},
  {
    label: 'Vẽ vùng',
    align: 'center',
    width: '120px',
    slots: {
      default: (scope: any) => (
          <ElTooltip content='Vẽ vùng'>
            <ApiButton
                circle={true}
                icon={EditPen}
                api={async () => {
                  await drawArea(scope.row);
                  return Promise.resolve();
                }}
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
    presetCameraId: cameraTmp.value
  }).then(res => {
    tableData.value = res.data
  }).finally(() => {
    isLoading.value = false
  })
}


const rtcPlayerRef = ref()
const drawArea = async (row: any) => {
  if (row.presetId) {
    await invokePresetApi({
      cameraId: row.presetCameraId,
      presetId: row.presetId
    }).then(() => {
      fullScreenVideo(row)
    })
  } else {
    fullScreenVideo(row)
  }
}

const fullScreenVideo = (row: any) => {
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
  viewerImages.value = [row.imagePath];
  startIndex.value = 0;
  viewerVisible.value = true;
}
</script>