<template>

  <div class="container main-container">
    <div class="grid">
      <div class="kpi-row">
        <div class="card kpi-card">
          <div class="kpi-label-group">
            <div class="kpi-lbl">Tổng Camera</div>
            <div class="kpi-val">{{ data?.camera ?? 0 }}</div>
          </div>
          <div class="kpi-icon bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label-group">
            <div class="kpi-lbl">Địa điểm giám sát</div>
            <div class="kpi-val">2</div>
          </div>
          <div class="kpi-icon bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label-group">
            <div class="kpi-lbl">Cảnh báo Mới</div>
            <div class="kpi-val" style="color:var(--danger)">5</div>
          </div>
          <div class="kpi-icon bg-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
        </div>
        <div class="card kpi-card">
          <div style="flex: 1;">
            <div class="kpi-lbl">Nhiệt độ Môi trường</div>
            <div class="region-temp-list-compact">
              <div class="temp-item-compact"><label>Bắc</label><b>22°C</b></div>
              <div class="temp-item-compact"><label>Trung</label><b>28°C</b></div>
              <div class="temp-item-compact"><label>Nam</label><b>34°C</b></div>
            </div>
          </div>
          <div class="kpi-icon bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Main Display Area -->
      <div class="card map-section" id="mainDisplayCard">
        <div class="map-toolbar">
          <span class="card-title" id="displayTitle">Bản đồ Giám sát</span>

          <!-- Location button separated -->
          <button class="map-btn visible-mobile-only location-btn" onclick="openAreaDrawer()"
                  title="Chọn khu vực">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>

          <div class="map-toggle-group">
            <button class="map-btn active" id="btnMap" onclick="switchView('map')">Bản đồ</button>
            <button class="map-btn" id="btnSLD" onclick="switchView('sld')">Sơ đồ 1 sợi</button>
            <button class="map-btn" id="btnBIM"
                    onclick="alert('Tính năng Mô hình BIM 3D đang được phát triển')">
              Mô hình BIM 3D
            </button>
          </div>
        </div>
        <div class="map-view-container mode-single" id="mapContainer">
          <div class="map-pane">
            <div class="map-label">{{ areaItem.name }}</div>
            <div class="w-full h-full">
              <LeafletMap
                  ref="leafletMapRef"
                  :key="itemKey"
                  :photo-path="areaItem.photoPath"
                  :map-type="areaItem.mapType"
                  :zoom="areaItem.zoom"
                  :latitude="areaItem.latitude"
                  :longitude="areaItem.longitude"
              >
                <sensor-marker
                    v-for="marker in liveMarkers"
                    :key="marker.updateAt"
                    :lat-lng="[marker.latitude, marker.longitude]"
                    @click="() => showMarkerInfo(marker)"
                    v-bind="getIconPaths(marker)"
                    @mouseover="() => markerHover(marker)"
                >
                </sensor-marker>
                <area-range
                    :point-list="areaRangePointList"
                    @clickMaker="(marker) => handleNodeClick(marker)"
                />
              </LeafletMap>
            </div>
          </div>
          </div>
      </div>
      <AreaTreeDashBoard
          :request-fn="getAllTreeAreaApi"
          @node-click="handleNodeClick"
          :default-expand-all="true"
          :check-strictly="true"
          :highlight-current="true"
          show-line
      ></AreaTreeDashBoard>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import {nextTick, onMounted, onUnmounted, ref} from 'vue'
import {getAllTreeAreaApi} from '@/api/area'
import {MAP_TYPE_MAP, MAP_TYPE_PICTURE} from '@/constants'
import LeafletMap from '@/views/dashboard/components/LeafletMap.vue'
import {
  createSignalRConnection,
  startSignalR,
  invokeSignalR,
  onSignalREvent,
  stopSignalR,
} from '@/plugins/signalr'
import {
  machinesAndResultByAreaApi,
  realTimeThermalDataApi,
  thermalByComponentApi,
} from '@/api/thermal-data'
import _ from 'lodash'
import AreaRange from '@/views/dashboard/components/AreaRange.vue'
import SensorMarker from "@/components/Map/SensorMarker.vue";
import AreaTreeDashBoard from "@/views/dashboard/components/AreaTreeDashBoard.vue";

onMounted(() => {
  loadThermalData({}, false)
  createSignalRConnection()
  startSignalR()
  onSignalREvent('newThermalData', function (thermalData: any) {
    liveTemperatureMap.value = {...liveTemperatureMap.value, ...thermalData}
    liveMarkers.value = liveMarkers.value.map(function (item, index) {
      return {
        ...item,
        updateAt: `${Date.now()}_${index}_${Math.floor(1000 + Math.random() * 9000)}`,
      }
    })
  })
})

onUnmounted(() => {
  stopSignalR()
})
const areaItem = ref({
  mapType: MAP_TYPE_MAP,
  zoom: 8,
  latitude: 21.0173,
  longitude: 105.8545,
  photoPath: '',
})

const getIconPaths = (mark: any) => {
  const level = liveTemperatureMap.value[mark.key]?.level
  const icon = {
    Bad: {iconColor: 'red', isBlink: true},
    Average: {iconColor: 'orange', isBlink: false},
    Fair: {iconColor: 'blue', isBlink: false},
    Good: {iconColor: 'green', isBlink: false},
  }
  return icon[level] ?? icon["Good"]
}

const leafletMapRef = ref()
const liveMarkers = ref<any[]>([])
const areaRangePointList = ref<any[]>([])
const liveTemperatureMap = ref({})
const thermalInfoMap = ref({})
const itemKey = ref(0)
const handleNodeClick = (item: any) => {
  itemKey.value = item.id
  if (item.mapType === MAP_TYPE_PICTURE) {
    item.latitude = 0
    item.longitude = 0
    item.zoom = 0
  }
  areaItem.value = item
  nextTick(() => {
    if (areaItem.value.mapType === MAP_TYPE_MAP) {
      leafletMapRef.value.flyToPoint()
    }
  })
  loadThermalData(item)
}

const loadThermalData = (area: any, invokeSignal = true) => {
  machinesAndResultByAreaApi({areaId: area?.id}).then((res) => {
    loadMachineComponents(res.data.item1 ?? [], invokeSignal)
    if (area.mapType == MAP_TYPE_PICTURE) {
      areaRangePointList.value = []
    } else {
      areaRangePointList.value = (res.data.item2 ?? []).filter((point: any) => point.latitude && point.longitude);
    }
  })
}
const loadMachineComponents = (components: any[], invokeSignal = true) => {
  nextTick(() => {
    if (invokeSignal) {
      const machineIds: string[] = [
        ...new Set(
            components.map((item) => item.machineId).filter((val): val is string => !!val),
        ),
      ]
      invokeSignalR('RegisterMachines', machineIds)
    }
    liveTemperatureMap.value = _.keyBy(components, 'key')
    liveMarkers.value = components.map(function (item, index) {
      return {
        ...item,
        updateAt: `${Date.now()}_${index}_${Math.floor(1000 + Math.random() * 9000)}`,
      }
    })
  })
}

const selectedComponentId = ref(null)
const selectedComponent = ref<any>(null)
const selectedThermalData = ref<any[]>([])
const loadingThermalData = ref(false)
const visibleThermalDetail = ref(false)
const showMarkerInfo = (marker: any) => {
  if (marker.deviceType === 'Sensor') {
    return
  }
  visibleThermalDetail.value = true
  selectedComponentId.value = marker.id
  selectedComponent.value = marker
  loadingThermalData.value = true
  thermalByComponentApi({
    machineId: marker.machineId,
    id: marker.id,
    deviceType: marker.deviceType,
  })
      .then((res) => {
        selectedThermalData.value = res.data
      })
      .finally(() => {
        loadingThermalData.value = false
      })
}

const markerHover = (marker: any) => {
  realTimeThermalDataApi({
    machineId: marker.machineId,
    id: marker.id,
    deviceType: marker.deviceType,
  }).then((res) => {
    thermalInfoMap.value[marker.id] = res.data
  })
}
</script>
<style scoped>
.region-temp-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 5px;
}

.region-temp-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-sub);
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.region-temp-item span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.region-temp-item span::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0.6;
}

.region-temp-item b {
  font-size: 14px;
  color: var(--success);
  font-family: 'JetBrains Mono', monospace;
}

.main-container {
  padding: 20px 24px;
}

@media (max-width: 768px) {
  .main-container {
    padding: 12px 16px;
  }
}

/* Fixed Full-Height Dashboard Layout */
.grid {
  grid-template-columns: 1fr 340px;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  gap: 20px;
  display: grid;
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
    overflow: visible;
  }

  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .tree-card,
  .map-section {
    height: 500px !important;
  }
}

@media (max-width: 540px) {
  .kpi-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .kpi-card {
    height: 80px;
    padding: 12px 16px !important;
  }

  .tree-card,
  .map-section {
    height: 400px !important;
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.kpi-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.kpi-icon {
  background: transparent !important;
  padding: 0 !important;
  width: 32px !important;
  height: 32px !important;
}

.kpi-icon svg {
  width: 24px;
  height: 24px;
}

.kpi-card {
  height: 100px;
  /* Removed !important */
  padding: 16px 20px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-card .kpi-label-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.region-temp-list-compact {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.temp-item-compact {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.temp-item-compact label {
  font-size: 10px;
  color: var(--text-sub);
  text-transform: uppercase;
}

.temp-item-compact b {
  font-size: 13px;
  color: var(--success);
  font-family: 'JetBrains Mono', monospace;
}

.tree-card {
  grid-column: 2 / 3;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-section {
  grid-column: 1 / 2 !important;
  height: 100%;
}


.tree-search-box {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s;
}

.tree-search-box:focus {
  border-color: var(--primary);
}

/* View Switching Logic */
.sld-view {
  display: none;
  height: 100%;
  background: #000;
  padding: 0;
  overflow: auto;
  position: relative;
}

.sld-diagram-wrapper {
  position: relative;
  min-width: 1200px;
  min-height: 800px;
  background-image: url('images/sodo-1day.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.sld-node {
  position: absolute;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.sld-node:hover {
  transform: scale(1.2);
}

.thermometer-icon {
  width: 24px;
  height: 24px;
  color: var(--success);
  filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
  transition: 0.2s;
}

@media (max-width: 768px) {
  .sld-node {
    width: 44px;
    height: 44px;
  }

  .thermometer-icon {
    width: 32px;
    height: 32px;
  }

  .sld-view::after {
    content: '↔ Vuốt để xem sơ đồ';
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    pointer-events: none;
    z-index: 1000;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.node-label-small {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: 0.2s;
}

.sld-node:hover .node-label-small {
  opacity: 1;
}

/* Popup Grid Layout */
.node-popup-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Popup Tabs */
.popup-tabs {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.popup-tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #6b7280;
  transition: 0.2s;
}

.popup-tab.active {
  color: var(--primary);
  background: #fff;
  border-bottom: 2px solid var(--primary);
}

.popup-content {
  display: none;
  max-height: 400px;
  overflow-y: auto;
}

.popup-content.active {
  display: block;
}

/* Analysis Card Style */
.analysis-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #e2e8f0;
}

.analysis-card:last-child {
  margin-bottom: 0;
}

.analysis-title {
  font-weight: 800;
  color: var(--primary);
  font-size: 15px;
  margin-bottom: 8px;
  border-bottom: 1px dashed #cbd5e1;
  padding-bottom: 4px;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.analysis-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.analysis-label {
  color: #475569;
  font-weight: 600;
}

.analysis-val {
  color: #0f172a;
  font-weight: 700;
}

.analysis-status {
  color: #10b981;
  font-weight: 800;
}

.chart-box-sld {
  display: none;
  /* Removed as requested */
}

.node-popup-body {
  padding: 15px;
  background: #fff;
}

.mini-chart-container {
  height: 200px;
  width: 100%;
}

.filter-section-modern {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
}

.filter-group-inline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.filter-group-inline label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-single-modern {
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  min-height: 38px;
}

.btn-search-primary {
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 24px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.date-range-box {
  display: flex;
  align-items: center;
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
  height: 38px;
  gap: 10px;
}

/* Interactive Node Popup - Premium Style */
.node-popup {
  position: absolute;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  width: 800px;
  max-width: 95vw;
  z-index: 10000;
  padding: 0;
  overflow: hidden;
  color: var(--text-main);
  display: none;
  font-family: 'Inter', sans-serif;
  pointer-events: auto;
  border: 1px solid var(--border);
  animation: popupFadeIn 0.2s ease-out;
  backdrop-filter: blur(10px);
}

@keyframes popupFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.node-popup-header {
  background: var(--bg-body);
  /* Theme-aware subtle header */
  padding: 16px 20px;
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
  color: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-popup-close {
  cursor: pointer;
  color: var(--text-sub);
  font-size: 20px;
  transition: 0.2s;
  line-height: 1;
}

.node-popup-close:hover {
  color: var(--danger);
  transform: scale(1.1);
}

.node-popup-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  background: var(--bg-card);
}

/* Analysis Card Style - Premium Unified */
.analysis-card {
  background: var(--bg-body);
  /* Use body bg for inner cards for contrast */
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  transition: 0.2s;
}

.analysis-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.analysis-title {
  font-weight: 700;
  color: var(--text-main);
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-sub);
}

.analysis-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.analysis-label {
  font-weight: 500;
}

.analysis-val {
  color: var(--text-main);
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.status-pill {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.status-pill.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

/* Triangle pointer for popup - Desktop only */
@media (min-width: 769px) {
  .node-popup::after {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 10px 10px 10px 0;
    border-style: solid;
    border-color: transparent var(--border) transparent transparent;
    display: block;
  }
}

/* Mobile specific popup logic */
@media (max-width: 768px) {
  .node-popup {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90% !important;
    max-width: 400px !important;
    max-height: 80vh !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1000px rgba(0, 0, 0, 0.6) !important;
  }

  .node-popup::after {
    display: none !important;
  }

  .node-popup-grid {
    grid-template-columns: 1fr !important;
  }

  .node-popup-body {
    padding: 15px;
  }
}

.date-range-box input {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 13px;
  width: 150px;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
}

.mode-sld .sld-view {
  display: flex;
  flex-direction: column;
}

.mode-sld #mapContainer {
  display: none !important;
}

.sld-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}
</style>