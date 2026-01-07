<template>
  <page-container>
    <div class="h-screen overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div class="md:col-span-3 col-span-12">
          <LiveTreeArea
              :request-fn="() => getAllTreeAreaApi({ cameras: true })"
              default-expand-all
              node-key="uniqueId"
              @updateCamSetting="updateCamSetting"
              @node-click="handleNodeClick"
          />
        </div>
        <div class="md:col-span-9 col-span-12" v-loading="loadingSetting">
          <div class="row-auto">
            <div class="flex justify-between">
              <el-form-item label="Thiết lập màn hình" :inline="true">
                <div class="flex flex-wrap gap-2">
                  <el-select
                      v-model="pageSize"
                      placeholder="Sửa số lượng màn hình"
                      style="width: 200px"
                      @change="changePageSize"
                  >
                    <el-option v-for="item in [1, 2, 4, 9]" :key="item" :label="item" :value="item"/>
                  </el-select>
                  <el-tooltip
                      effect="dark"
                      content="Sửa vị trí hiển thị của camera"
                  >
                    <el-button @click="showOrderDialog" :icon="Setting"></el-button>
                  </el-tooltip>
                  <el-button
                      v-if="!visibleOrderSetting"
                      @click="loadPinedCamera"
                      type="primary"
                  >
                    Xem camera đã ghim
                  </el-button>
                </div>
              </el-form-item>
              <p v-show="environmentTemperature !== null" class="text-red-500">Nhiệt độ môi trường:
                {{ environmentTemperature?.temperature ?? "" }} </p>
            </div>
          </div>
          <base-dialog v-model="visibleSortSetting">
            <sort-setting
                :table-data="fullList"
                @close-dialog="visibleSortSetting = false"
                @updateCamSetting="updateCamSetting"
            ></sort-setting>
          </base-dialog>
          <div :class="['grid',mapGridRows[paginatedData.length] ?? '', 'items-stretch gap-0.5 w-full']">
            <div v-for="cam in paginatedData" :key="cam.id" class="min-w-0">
              <web-r-t-c-player :cam="cam" :streamKey="cam.id"/>
            </div>
          </div>
          <div class="mt-2 flex justify-center">
            <el-pagination
                v-show="totalItems"
                @current-change="handlePageChange"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="totalItems"
                layout="prev, pager, next"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
  </page-container>
</template>

<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import WebRTCPlayer from '@/components/Video/WebRTCPlayer.vue'
import {getAllTreeAreaApi} from '@/api/area'
import LiveTreeArea from "@/components/Tree/LiveTreeArea.vue";
import {computed, onMounted, ref} from "vue";
import {Setting} from "@element-plus/icons-vue";
import {getCameraSettingApi, updateCameraSettingApi} from "@/api/camera-setting";
import BaseDialog from "@/components/Dialog/BaseDialog.vue";
import SortSetting from "@/views/live/components/SortSetting.vue";
import {CAMERA_COMMANDS} from "@/constants";
import {isCam} from "@/utils/cameraUtils";
import {environmentThermalApi} from "@/api/thermal-data";

const fullList = ref<any[]>([])
const mapGridRows = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2',
  4: 'grid-cols-2',
  5: 'grid-cols-2',
  6: 'grid-cols-2',
  7: 'grid-cols-3',
  8: 'grid-cols-3',
  9: 'grid-cols-3',
}
const pageSize = ref()
const currentPage = ref(1)

const loadingSetting = ref(false)
const visibleOrderSetting = ref(true)
const visibleSortSetting = ref(false)
const environmentTemperature = ref<any>(null)
const selectedAreaId =  ref(null)

const totalItems = computed(() => fullList.value.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return fullList.value.slice(start, start + pageSize.value)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const changePageSize = () => {
  updateCameraSettingApi({
    flagCommand: CAMERA_COMMANDS.SCREEN_NUMBER,
    screenNumber: pageSize.value
  }).then(res => {
    updateCamSetting(res.data)
  })
}

const updateCamSetting = (data: any) => {
  pageSize.value = data?.screenNumber ?? 4
  fullList.value = data?.cameraInfo ?? []
}
const loadCamSetting = () => {
  loadingSetting.value = true
  getCameraSettingApi().then(res => {
    updateCamSetting(res.data)
    const areaId = res.data?.cameraInfo?.[0]?.areaId ?? 0
    areaId && loadEnvironmentThermal(areaId)
  }).finally(() => {
    loadingSetting.value = false
  })
}
const loadPinedCamera = () => {
  visibleOrderSetting.value = true
  loadCamSetting()
}
const handleNodeClick = (originItem: any) => {
  if (isCam(originItem)) {
    fullList.value = [originItem]
    loadEnvironmentThermal(originItem.areaId)
  } else {
    selectedAreaId.value = originItem.id
    fullList.value = collectCams(originItem)
    loadEnvironmentThermal(originItem.id)
  }
  visibleOrderSetting.value = false;
}

const loadEnvironmentThermal = (areaId: any) => {
  environmentTemperature.value = null
  environmentThermalApi({areaId: areaId}).then(res => {
    environmentTemperature.value = res.data
  })
}

const collectCams = (node: any): any[] => {
  let result: any[] = [];

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (isCam(child)) {
        result.push(child);
      } else {
        result.push(...collectCams(child)); // Đệ quy
      }
    }
  }

  return result;
};

const showOrderDialog = () => {
  visibleSortSetting.value = true
}

onMounted(() => {
  loadCamSetting()
})
</script>
