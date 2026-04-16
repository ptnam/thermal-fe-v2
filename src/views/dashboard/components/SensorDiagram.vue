<template>
    <sensor-marker v-for="marker in liveMarkers" :key="marker.updateAt" :lat-lng="[marker.latitude, marker.longitude]"
        @click="() => emit('showMarkerInfo', marker)" v-bind="getIconPaths(marker)"  @mouseover="() => markerHover(marker)">
        <l-tooltip permanent :key="marker?.updateAt">
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
import TooltipInfo from '@/views/dashboard/components/TooltipInfo.vue'
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
const emit = defineEmits(['showMarkerInfo', 'handleNodeClick'])

const thermalInfoMap = ref({})

const getIconPaths = (mark: any) => {
    const level = props.liveTemperatureMap[mark.key]?.level
    const icon = {
        Bad: { iconColor: 'red', isBlink: true },
        Average: { iconColor: 'orange', isBlink: false },
        Fair: { iconColor: 'blue', isBlink: false },
        Good: { iconColor: 'green', isBlink: false },
    }
    return icon[level] ?? icon["Good"]
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