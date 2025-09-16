<template>
  <page-container :title="t('map.page_title')">
    <div class="grid grid-flow-col grid-cols-1 md:grid-cols-10 gap-4">
      <!-- Column 1 (8 columns on md and up) -->
      <div class="md:col-span-8 col-span-12">
        <div style="height: 80vh">
          <LeafletMap
            ref="leafletMapRef"
            :key="itemKey"
            :photo-path="areaItem.photoPath"
            :map-type="areaItem.mapType"
            :zoom="areaItem.zoom"
            :latitude="areaItem.latitude"
            :longitude="areaItem.longitude"
          >
            <live-marker
              v-for="marker in liveMarkers"
              :key="marker.updateAt"
              :lat-lng="[marker.latitude, marker.longitude]"
              @click="() => showMarkerInfo(marker)"
              v-bind="getIconPaths(marker)"
              @mouseover="() => markerHover(marker)"
            >
              <l-tooltip permanent :key="marker.updateAt">
                <div class="card">
                  <TooltipInfo
                    :key="marker.updateAt"
                    :marker="marker"
                    :liveTemperature="liveTemperatureMap[marker.key]"
                    :thermalInfo="thermalInfoMap[marker.id]"
                  />
                </div>
              </l-tooltip>
            </live-marker>
          </LeafletMap>
        </div>
      </div>
      <div class="md:col-span-2 col-span-12 px-0.5">
        <el-scrollbar>
          <area-tree
            :request-fn="getAllTreeAreaApi"
            @node-click="handleNodeClick"
            :default-expand-all="true"
            :check-strictly="true"
            :highlight-current="false"
            show-line
          />
        </el-scrollbar>
      </div>
      <base-dialog v-model="visibleThermalDetail" :close-on-click-modal="true">
        <div class="mt-4" v-loading="loadingThermalData">
          <thermal-data :marker="selectedComponent" :thermalInfo="selectedThermalData">
          </thermal-data>
        </div>
      </base-dialog>
    </div>
  </page-container>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import PageContainer from '@/components/PageContainer.vue'
import { useLang } from '@/hooks/web/useI18n.js'
import { getAllTreeAreaApi } from '@/api/area'
import { MAP_TYPE_MAP, MAP_TYPE_PICTURE } from '@/constants'
import LeafletMap from '@/views/dashboard/components/LeafletMap.vue'
import AreaTree from '@/components/Tree/AreaTree.vue'
import LiveMarker from '@/components/Map/LiveMarker.vue'
import { LTooltip } from '@vue-leaflet/vue-leaflet'
import {
  createSignalRConnection,
  startSignalR,
  invokeSignalR,
  onSignalREvent,
  stopSignalR,
} from '@/plugins/signalr'
import ThermalData from '@/views/dashboard/components/ThermalData.vue'
import TooltipInfo from '@/views/dashboard/components/TooltipInfo.vue'
import {
  machinesAndResultByAreaApi,
  realTimeThermalDataApi,
  thermalByComponentApi,
} from '@/api/thermal-data'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import _ from 'lodash'

onMounted(() => {
  createSignalRConnection()
  startSignalR()
  onSignalREvent('newThermalData', function (thermalData: any) {
    liveTemperatureMap.value = { ...liveTemperatureMap.value, ...thermalData }
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

const { t } = useLang()
const areaItem = ref({
  mapType: MAP_TYPE_MAP,
  zoom: 8,
  latitude: 21.0173,
  longitude: 105.8545,
  photoPath: '',
})

const goodCamUrl = new URL('@/assets/map/camera-on.png', import.meta.url).href
const badCamUrl = new URL('@/assets/map/camera-off.png', import.meta.url).href

const goodSensorUrl = new URL('@/assets/map/good-sensor.svg', import.meta.url).href
const badSensorUrl = new URL('@/assets/map/bad-sensor.svg', import.meta.url).href

const goodCamSensorUrl = new URL('@/assets/map/camera-sensor-good.png', import.meta.url).href
const badCamSensorUrl = new URL('@/assets/map/camera-sensor-bad.png', import.meta.url).href

const mapIcon = {
  Sensor: {
    good: { iconPath: goodSensorUrl, isBlink: false },
    bad: { iconPath: badSensorUrl, isBlink: true },
  },
  Camera: {
    good: { iconPath: goodCamUrl, isBlink: false },
    bad: { iconPath: badCamUrl, isBlink: true },
  },
  CameraSensor: {
    good: { iconPath: goodCamSensorUrl, isBlink: false },
    bad: { iconPath: badCamSensorUrl, isBlink: true },
  },
}
const getIconPaths = (mark: any) => {
  const level = liveTemperatureMap.value[mark.key]?.level
  const icon = mapIcon[mark.monitorPointIcon]
  if(icon) {
    if (level === 'Bad') {
      return icon.bad
    }
    return icon.good
  }
}
const leafletMapRef = ref()
const liveMarkers = ref<any[]>([])
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
  loadThermalData(item.id)
}

const loadThermalData = (areaId: number, invokeSignal = true) => {
  machinesAndResultByAreaApi({ areaId: areaId }).then((res) => {
    const components: any[] = res.data
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
