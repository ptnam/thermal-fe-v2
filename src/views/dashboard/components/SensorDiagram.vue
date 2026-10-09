<template>
    <sensor-marker v-for="marker in liveMarkers" :key="marker.deviceType === 'Pd' ? `pd_${marker.machineId}` : marker.updateAt"
        :lat-lng="[marker.latitude, marker.longitude]"
        @click="() => onMarkerClick(marker)" v-bind="getIconPaths(marker)" @mouseover="() => markerHover(marker)">
        <l-tooltip v-if="marker.deviceType === 'Pd'" permanent :key="`pd-tip-${marker.machineId}`">
          <PdTooltipInfo
              :machine="marker"
              :components="pdTooltipCache[marker.machineId]?.components ?? []"
              :loading="pdTooltipCache[marker.machineId]?.loading ?? true"
              :stale="isPdReadingStale(liveTemperatureMap[marker.key]?.dataTime)"
          />
        </l-tooltip>
        <l-tooltip v-else permanent :key="marker?.updateAt">
          <div class="card">
            <TooltipInfo
              :key="marker.updateAt"
              :marker="marker"
              :thermalInfo="thermalInfoMap[marker.id]"
            />
          </div>
        </l-tooltip>
    </sensor-marker>
    <area-range :point-list="areaRangePointList" @clickMaker="(marker) => emit('handleNodeClick', marker)" />
</template>

<script setup lang="ts">
import { LTooltip } from '@vue-leaflet/vue-leaflet'
import AreaRange from '@/views/dashboard/components/AreaRange.vue'
import SensorMarker from "@/components/Map/SensorMarker.vue";
import { realTimeThermalDataApi } from '@/api/thermal-data'
import { pdLevelsByMachineApi } from '@/api/pd-data'
import TooltipInfo from '@/views/dashboard/components/TooltipInfo.vue'
import PdTooltipInfo from '@/views/dashboard/components/PdTooltipInfo.vue'
import { ref } from 'vue'

const props = defineProps({
    liveMarkers: {
        type: Array<any>,
        default: () => []
    },
    areaRangePointList: {
        type: Array,
        default: () => []
    },
    liveTemperatureMap: {
        type: Object,
        default: () => ({})
    },
    handleNodeClick: {
        type: Function,
        default: () => { }
    },
})
const emit = defineEmits(['showMarkerInfo', 'handleNodeClick', 'showPdMachineInfo'])

const thermalInfoMap = ref({})

// Bảng màu riêng cho marker PD - Bad chớp nháy để dễ nhận biết đang vượt ngưỡng.
const pdIcon: Record<string, { iconColor: string; isBlink: boolean }> = {
    Bad: { iconColor: 'red', isBlink: true },
    Average: { iconColor: 'orange', isBlink: false },
    Fair: { iconColor: 'blue', isBlink: false },
    Good: { iconColor: 'green', isBlink: false },
}

// Thiết bị PD chỉ tạo event khi vượt ngưỡng, nên quá PD_STALE_MS kể từ lần đọc gần nhất coi như hết
// phóng điện (icon về Xanh).
const PD_STALE_MS = 15 * 60 * 1000
const isPdReadingStale = (dataTime: any) => {
    if (!dataTime) return true
    const readAt = new Date(dataTime).getTime()
    if (Number.isNaN(readAt)) return true
    return Date.now() - readAt > PD_STALE_MS
}

const getIconPaths = (mark: any) => {
    const level = props.liveTemperatureMap[mark.key]?.level
    if (mark.deviceType === 'Pd') {
        const stale = isPdReadingStale(props.liveTemperatureMap[mark.key]?.dataTime)
        const pdColorInfo = stale ? pdIcon['Good'] : (pdIcon[level] ?? pdIcon['Good'])
        return { ...pdColorInfo, iconVariant: 'pd' }
    }
    const icon = {
        Bad: { iconColor: 'red', isBlink: true },
        Average: { iconColor: 'orange', isBlink: false },
        Fair: { iconColor: 'blue', isBlink: false },
        Good: { iconColor: 'green', isBlink: false },
    }
    return icon[level] ?? icon["Good"]
}

const onMarkerClick = (marker: any) => {
    if (marker.deviceType === 'Pd') {
        emit('showPdMachineInfo', marker)
        return
    }
    emit('showMarkerInfo', marker)
}

// Dữ liệu tooltip PD theo machineId, tải khi hover (nhẹ, không tự refresh khi realtime tới - cùng cách thermal đang làm).
const pdTooltipCache = ref<Record<number, { loading: boolean; components: any[] }>>({})
const loadPdTooltipData = (marker: any) => {
    const machineId = marker.machineId
    const cached = pdTooltipCache.value[machineId]
    if (cached?.loading) return
    pdTooltipCache.value = {
        ...pdTooltipCache.value,
        [machineId]: { loading: true, components: cached?.components ?? [] },
    }
    pdLevelsByMachineApi(machineId)
        .then((res) => {
            pdTooltipCache.value = { ...pdTooltipCache.value, [machineId]: { loading: false, components: res.data ?? [] } }
        })
        .catch(() => {
            pdTooltipCache.value = {
                ...pdTooltipCache.value,
                [machineId]: { loading: false, components: pdTooltipCache.value[machineId]?.components ?? [] },
            }
        })
}

const markerHover = (marker: any) => {
  if (marker.deviceType === 'Pd') {
    loadPdTooltipData(marker)
    return
  }
  realTimeThermalDataApi({
    machineId: marker.machineId,
    id: marker.id,
    deviceType: marker.deviceType,
  }).then((res) => {
    thermalInfoMap.value[marker.id] = res.data
  })
}
</script>
