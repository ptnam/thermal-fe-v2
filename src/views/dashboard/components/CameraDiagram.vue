<template>
    <camera-marker 
        v-for="marker in liveMarkers" 
        :key="marker.id" 
        :lat-lng="[marker?.latitude ?? 0, marker?.longitude ?? 0]"
        @click="() => emit('showMarkerInfo', marker)">
        <l-tooltip permanent :key="marker?.id">
            {{ marker?.name }}
        </l-tooltip>
    </camera-marker>
</template>

<script setup lang="ts">
import { LTooltip } from '@vue-leaflet/vue-leaflet'
import CameraMarker from '@/components/Map/CameraMarker.vue';

const emit = defineEmits(['showMarkerInfo'])

 defineProps({
    liveMarkers: {
        type: Array<any>,
        default: () => []
    },
});

</script>