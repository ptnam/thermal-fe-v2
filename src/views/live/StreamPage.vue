<template>
  <div class="container">
    <div class="grid monitor-layout-grid">

      <!-- Left Card: Area Tree -->
      <div class="hidden md:block">
        <area-tree-live
            ref="treeLiveRef"
            :request-fn="() => getAllTreeAreaApi({ cameras: true })"
            default-expand-all
            node-key="uniqueId"
            @updateCamSetting="updateCamSetting"
            @nodeClick="handleNodeClick">
        </area-tree-live>
      </div>

      <!-- Right Card: Monitoring Area -->
      <div class="card live-content">
        <div class="monitor-top-bar" style="border-radius: 12px 12px 0 0;">
          <div class="ctrl-group">
            <el-button class="mobile-btn" @click="() => drawerVisibleTree = !drawerVisibleTree">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </el-button>
            <button class="btn-settings" @click="openDrawer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                </path>
              </svg>
              Thiết lập
            </button>
            <el-button :icon="FullScreen" @click="requestFullScreen" title="Toàn màn hình"></el-button>
            <div class="max-w-[120px] md:w-fit overflow-x-auto lg:max-w-none">
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
          <div v-show="environmentTemperature !== null" class="env-temp">Nhiệt độ môi trường:
            {{ environmentTemperature?.temperature ?? "" }}
          </div>
        </div>

        <div class="cam-grid" id="mainCamGrid" ref="mainCamGridRef"
             :style="{gridTemplateColumns: pageSizeCol, alignContent: 'start'}">
          <web-player v-for="cam in paginatedData" :key="cam.id" :cam="cam" :streamKey="cam.id" :style="cellStyle"></web-player>
        </div>
      </div>
      <el-drawer class="block md:hidden" v-model="drawerVisibleTree" direction="ltr" size="90%">
        <area-tree-live
          ref="treeLiveRef"
          :request-fn="() => getAllTreeAreaApi({ cameras: true })"
          default-expand-all
          node-key="uniqueId"
          outer-class="card modern-tree-sidebar !relative !w-full"
          @updateCamSetting="updateCamSetting"
          @nodeClick="handleNodeClick">
        </area-tree-live>
      </el-drawer>
      <el-drawer v-model="drawerVisible" style="min-width: 300px;" :destroy-on-close="true" resizable
                 :with-header="false">
        <drawer-setting
            :list-marked="fullList"
            :screenNumber="pageSize"
            @close="()=>drawerVisible = false"
            @updatePage="updatePage"
            @treeChange="updateFullList"
            @applySettings="applySettings"
        >
        </drawer-setting>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getCameraSettingApi } from '@/api/camera-setting'
import { isCam } from '@/utils/cameraUtils'
import { environmentThermalApi } from '@/api/thermal-data'
import WebPlayer from '@/components/Video/WebPlayer.vue'
import { getAllTreeAreaApi } from '@/api/area'
import DrawerSetting from '@/views/live/components/DrawerSetting.vue'
import { ElDrawer, ElMessage } from 'element-plus'
import AreaTreeLive from '@/views/live/components/AreaTreeLive.vue'
import { FullScreen } from '@element-plus/icons-vue'

const fullList = ref<any[]>([])

const treeLiveRef = ref()
const pageSize = ref()
const currentPage = ref(1)

const loadingSetting = ref(false)
const visibleOrderSetting = ref(true)
const drawerVisible = ref(false)
const drawerVisibleTree = ref(false)
const environmentTemperature = ref<any>(null)
const selectedAreaId = ref(null)

const totalItems = computed(() => fullList.value.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return fullList.value.slice(start, start + pageSize.value)
})

const pageSizeCol = computed(() => {
  if (fullList.value.length === 1 || pageSize.value === 1) {
    return 'repeat(1, 1fr)'
  }
  if (fullList.value.length === 2 || pageSize.value === 2) {
    return 'repeat(2, 1fr)'
  }
  const va = Math.sqrt(pageSize.value)
  return `repeat(${va}, 1fr)`
})
const mainCamGridRef = ref()

const gridGap = ref(10)
const colCount = ref(1)
const rowCount = ref(1)
const cellWidth = ref(0)
const cellHeight = ref(0)

const cellStyle = computed(() => ({
  width: cellWidth.value >= 0 ? `${cellWidth.value}px` : undefined,
  height: cellHeight.value >= 0 ? `${cellHeight.value}px` : undefined,
  minWidth: '0',
  minHeight: '0',
  overflow: 'hidden',
}))

function getGridLayout(count) {
  if (count <= 1) {
    return { colCount: 1, rowCount: 1 }
  }

  if (count === 2) {
    return { colCount: 2, rowCount: 2 }
  }

  if (count <= 4) {
    return { colCount: 2, rowCount: 2 }
  }

  return { colCount: 3, rowCount: 3 }
}

function updateGridLayout() {
  if (isMobile.value) {
    cellWidth.value = -1;
    cellHeight.value = -1;
    return;
  }
  const gridEl = mainCamGridRef.value
  if (paginatedData.value.length === 1) {
    cellWidth.value = gridEl.clientWidth;
    cellHeight.value = gridEl.clientHeight;
    return;
  }
  if (!gridEl) return

  const layout = getGridLayout(pageSize.value)

  const containerWidth = gridEl.clientWidth
  const containerHeight = gridEl.clientHeight
  const gap = gridGap.value

  const totalGapWidth = (layout.colCount - 1) * gap
  const totalGapHeight = (layout.rowCount - 1) * gap

  const nextCellWidth = Math.floor((containerWidth - totalGapWidth) / layout.colCount)
  const nextCellHeight = Math.floor((containerHeight - totalGapHeight) / layout.rowCount)

  colCount.value = layout.colCount
  rowCount.value = layout.rowCount
  cellWidth.value = Math.max(nextCellWidth, 0)
  cellHeight.value = Math.max(nextCellHeight, 0)
}

watch(pageSizeCol, function(value) {
  nextTick(() => {
    updateGridLayout()
  })
})

const isFullScreen = ref(false)
const requestFullScreen = () => {
  mainCamGridRef.value.requestFullscreen();
}
const updateCamSetting = (data: any) => {
  pageSize.value = data?.screenNumber ?? 4
  fullList.value = data?.cameraInfo ?? []
}

const updatePage = (value: any) => {
  pageSize.value = value
}
const updateFullList = (value: any[]) => {
  fullList.value = value
}

const applySettings = () => {
  drawerVisible.value = false
  treeLiveRef?.value?.fetch()
  ElMessage({
    message: 'Lưu thành công!',
    type: 'success',
  })
}

const handlePageChange = (page: number) => {
  currentPage.value = page
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
  drawerVisibleTree.value =false
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

const openDrawer = () => {
  drawerVisible.value = true
}

const handleFullscreenChange = async () => {
  isFullScreen.value = document.fullscreenElement === mainCamGridRef.value

  await nextTick()
  updateGridLayout()
}

const isMobile = ref(false)

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const handleResize = () => {
  checkIsMobile()
  nextTick(()=> {
    updateGridLayout()
  })
}

onMounted(() => {
  checkIsMobile()
  loadCamSetting();
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('resize', handleResize)
})
</script>
<style>
video{
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
}
video-stream{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>