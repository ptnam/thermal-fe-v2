<template>
  <live-marker
    v-for="marker in pointList"
    :lat-lng="[marker?.latitude, marker?.longitude]"
    :is-blink="false"
    :icon-path="icon"
    @click="() => callClick(marker)"
  >
    <l-tooltip permanent>{{ marker.name }}</l-tooltip>
  </live-marker>
</template>
<script setup lang="ts">
import LiveMarker from '@/components/Map/LiveMarker.vue'
import { LTooltip } from '@vue-leaflet/vue-leaflet'
const icon = new URL('@/assets/map/point.png', import.meta.url).href

const emits = defineEmits(['clickMaker'])
const callClick = (marker: any) => {
  emits('clickMaker', marker)
}
defineProps({
  pointList: { type: Array<any>, required: true },
})
</script>
