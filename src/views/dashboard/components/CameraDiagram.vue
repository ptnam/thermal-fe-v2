<template>
    <camera-marker 
        v-for="marker in liveMarkers" 
        :key="marker.id" 
        :lat-lng="[marker.latitude, marker.longitude]"
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

const props = defineProps({
    liveMarkers: {
        type: Array,
        default: () => []
    },
});

</script>