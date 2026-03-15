<template>
    <sensor-marker v-for="marker in liveMarkers" :key="marker.updateAt" :lat-lng="[marker.latitude, marker.longitude]"
        @click="() => emit('showMarkerInfo', marker)" v-bind="getIconPaths(marker)">
        <l-tooltip permanent :key="marker?.updateAt">
            {{ marker?.name }}
        </l-tooltip>
    </sensor-marker>
    {{liveMarkers}}
    <area-range :point-list="areaRangePointList" @clickMaker="(marker) => emit('handleNodeClick', marker)" />
</template>

<script setup lang="ts">
import { LTooltip } from '@vue-leaflet/vue-leaflet'
import AreaRange from '@/views/dashboard/components/AreaRange.vue'
import SensorMarker from "@/components/Map/SensorMarker.vue";

const props = defineProps({
    liveMarkers: {
        type: Array,
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
</script>