<template>
  <live-marker
      v-for="marker in pointList"
      :lat-lng="[marker?.latitude, marker?.longitude]"
      :is-blink="false"
      :icon-path="icon"
  ></live-marker>
</template>
<script setup lang="ts">
import LiveMarker from "@/components/Map/LiveMarker.vue";
import {machinesAndResultByAreaApi} from "@/api/thermal-data";
import {onMounted, ref} from "vue";
const icon = new URL('@/assets/map/point.png', import.meta.url).href
const pointList = ref<any[]>([])
const fetch = () => {
  machinesAndResultByAreaApi({}).then(res => {
    pointList.value = res.data
  })
}

onMounted(() => {
  fetch()
})
</script>