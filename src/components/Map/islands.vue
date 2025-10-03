<template>
  <l-polygon
    v-for="data in openstreetmap.polygonBaoQuanh"
    :lat-lngs="data.latlngs"
    :l-style="openstreetmap.polygonbao.style"
    :weight="2"
    :opacity="1"
    color="#aad3df"
    dashArray=""
    :fillOpacity="1"
    fillColor="#aad3df"
  >
  </l-polygon>
  <l-polygon
    v-for="data in openstreetmap.polygonDao"
    :lat-lngs="data.latlngs"
    :weight="2"
    :opacity="1"
    color="#a29ab5"
    dashArray="3"
    :fillOpacity="1"
    fillColor="#aad3df"
  >
  </l-polygon>
  <l-marker :visible="zoom >= 4" :lat-lng="[16.5, 113]">
    <l-icon :icon-size="[150, 30]" :icon-anchor="[75, 15]" className="bg-transparent">
      <div class="text-[#777877]">
        Quần đảo <br />
        Hoàng Sa
      </div>
    </l-icon>
  </l-marker>

  <l-marker :visible="zoom >= 4" :lat-lng="[9.5, 115.5]">
    <l-icon :icon-size="[180, 30]" :icon-anchor="[90, 15]" className="bg-transparent">
      <div class="text-[#777877]">
        Quần đảo<br />
        Trường Sa
      </div>
    </l-icon>
  </l-marker>
</template>
<script setup lang="ts">
import openstreetmap from '@/assets/map/openstreetmap.json'
import { LPolygon, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'

defineProps({
  zoom: { type: Number, default: 6 },
})
</script>
