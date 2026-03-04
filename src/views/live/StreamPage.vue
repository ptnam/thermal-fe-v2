<template>
  <div class="container">
    <div class="grid monitor-layout-grid">

      <!-- Left Card: Area Tree -->
      <div class="card modern-tree-sidebar">
        <LiveTreeArea
            :request-fn="() => getAllTreeAreaApi({ cameras: true })"
            default-expand-all
            node-key="uniqueId"
            @updateCamSetting="updateCamSetting"
            @node-click="handleNodeClick"
        />
      </div>

      <!-- Right Card: Monitoring Area -->
      <div class="card live-content">
        <div class="monitor-top-bar" style="border-radius: 12px 12px 0 0;">
          <button id="sidebarToggle" class="mobile-only sidebar-toggle-btn" onclick="toggleSidebar()" style="margin-right: 10px; background: var(--primary); color: white; border: none; padding: 8px; border-radius: 4px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>
          <div class="ctrl-group">
            <button class="btn-settings" @click="openDrawer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                </path>
              </svg>
              Thiết lập
            </button>
          </div>
          <div v-show="environmentTemperature !== null" class="env-temp">Nhiệt độ môi trường: {{ environmentTemperature?.temperature ?? "" }}</div>
        </div>

        <div class="cam-grid" id="mainCamGrid">
          <div v-for="cam in paginatedData" :key="cam.id" class="cam-cell">
            <web-player :cam="cam" :streamKey="cam.id"></web-player>
          </div>
        </div>
      </div>
      <el-drawer v-model="drawerVisible" style="min-width: 650px" :destroy-on-close="true" resizable :with-header="false">
        <drawer-setting
          :list-marked="fullList"
          :screenNumber="pageSize"
          @close="()=>drawerVisible = false"
          @updatePage="(value)=>pageSize.value = value"
        >
        </drawer-setting>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {getCameraSettingApi, updateCameraSettingApi} from "@/api/camera-setting";
import {CAMERA_COMMANDS} from "@/constants";
import {isCam} from "@/utils/cameraUtils";
import {environmentThermalApi} from "@/api/thermal-data";
import WebPlayer from "@/components/Video/WebPlayer.vue";
import {getAllTreeAreaApi} from "@/api/area";
import LiveTreeArea from "@/components/Tree/LiveTreeArea.vue";
import DrawerSetting from '@/views/live/components/DrawerSetting.vue'
import { ElDrawer } from 'element-plus'

const fullList = ref<any[]>([])

const pageSize = ref()
const currentPage = ref(1)

const loadingSetting = ref(false)
const visibleOrderSetting = ref(true)
const visibleSortSetting = ref(false)
const drawerVisible = ref(false)
const environmentTemperature = ref<any>(null)
const selectedAreaId =  ref(null)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  debugger
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

const openDrawer = () => {
  drawerVisible.value = true
}

onMounted(() => {
  loadCamSetting()
})
</script>
