<template>
  <div class="container">
    <div class="grid monitor-layout-grid">

      <!-- Left Card: Area Tree -->
      <div class="card modern-tree-sidebar" id="liveSidebar">
        <div class="modern-tree-title">
          <span>Danh sách khu vực</span>
          <button class="close-sidebar mobile-only" onclick="toggleSidebar()">×</button>
        </div>
        <div class="modern-tree-search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" class="modern-tree-search-box" placeholder="Tìm trạm, camera...">
        </div>

        <div class="modern-area-tree">
          <!-- PHU QUOC SECTION -->
          <div class="modern-tree-section-header">KHU VỰC PHÚ QUỐC</div>

          <div class="modern-at-node expanded">
            <div class="modern-at-item" onclick="toggleAreaNode(this)">
              <div class="modern-at-parent-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span class="card-title">Trạm 110kV Nam PQ</span>
              <svg class="modern-at-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </div>
            <div class="modern-at-children">
              <div class="modern-at-leaf active">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>Cam thường cố định</span>
                <svg class="modern-flag-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </div>
              <div class="modern-at-leaf">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>Cam thường quay quét</span>
              </div>
              <div class="modern-at-leaf thermal">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>Cam nhiệt cố định</span>
              </div>
              <div class="modern-at-leaf thermal">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>Cam nhiệt quay quét</span>
              </div>
            </div>
          </div>

          <!-- LIEN TRI SECTION -->
          <div class="modern-tree-section-header">KHU VỰC LIÊN TRÌ</div>

          <div class="modern-at-node">
            <div class="modern-at-item" onclick="toggleAreaNode(this)">
              <div class="modern-at-parent-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span class="card-title">Trạm 110kV Liên Trì</span>
              <svg class="modern-at-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </div>
            <div class="modern-at-children">
              <div class="modern-at-leaf">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>PTZ Mắt thường ĐN</span>
              </div>
              <div class="modern-at-leaf">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>Bullet mắt thường ĐN</span>
              </div>
              <div class="modern-at-leaf thermal">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>PTZ Mắt nhiệt ĐN</span>
              </div>
              <div class="modern-at-leaf thermal">
                <div class="modern-at-leaf-icon-box">
                  <div class="modern-online-dot"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>Bullet mắt nhiệt ĐN</span>
              </div>
            </div>
          </div>
        </div>
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

            <button class="btn-settings" onclick="openDrawer()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                </path>
              </svg>
              Thiết lập
            </button>
          </div>
          <div class="env-temp">Nhiệt độ môi trường: 32.5</div>
        </div>

        <div class="cam-grid" id="mainCamGrid">
          <div v-for="cam in paginatedData" :key="cam.id" class="cam-cell">
            <div class="cam-header">
              <div style="display:flex; align-items:center; gap:8px">
                <div class="dot-live"></div>
                <span class="cam-name-tag">{{ cam.name }} ({{ cam.name }})</span>
              </div>
              <span class="cam-time-tag">28.Jan 2026 09:55:08</span>
            </div>
            <web-r-t-c-player class="cam-img"  :cam="cam" :streamKey="cam.id"/>
            <div class="cam-footer">
              <button class="cam-action-btn" title="Thiết lập vùng AI">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L4 2l3.5 12.5L15 16l3-3z"></path>
                </svg>
              </button>
              <button class="cam-action-btn" title="Thêm điểm đo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </button>
              <button class="cam-action-btn" title="Chụp ảnh">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
              <button class="cam-action-btn" title="Ghi hình">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <rect x="9" y="9" width="6" height="6"></rect>
                </svg>
              </button>
              <button class="cam-action-btn" title="Tuần tra/Preset">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                  <polyline points="21 3 21 8 16 8"></polyline>
                </svg>
              </button>
              <button class="cam-action-btn" title="Tắt cảnh báo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </button>
              <button class="cam-action-btn" title="Toàn màn hình" onclick="window.location.href='camera.html'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
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
