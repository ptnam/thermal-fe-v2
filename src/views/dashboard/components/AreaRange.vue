<template>
  <live-marker
    v-for="marker in pointList"
    :lat-lng="[marker?.latitude, marker?.longitude]"
    :is-blink="false"
    :icon-path="icon"
  ></live-marker>
</template>
<script setup lang="ts">
import LiveMarker from '@/components/Map/LiveMarker.vue'
const icon = new URL('@/assets/map/point.png', import.meta.url).href

defineProps({
  pointList: { type: Array<any>, required: true },
})
</script>
