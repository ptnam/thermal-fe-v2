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
</template>
<script setup lang="ts">
import openstreetmap from '@/assets/map/openstreetmap.json'
import { LPolygon } from '@vue-leaflet/vue-leaflet'
</script>