<template>
  <l-polygon
    v-for="data in openstreetmap.polygonBaoQuanh"
    :lat-lngs="data.latlngs"
    :l-style="{...openstreetmap.polygonbao.style, fillColor: store.isDark ? '#090909' : '#aad3df'}"
    :weight="2"
    :opacity="1"
    :color="store.isDark ? '#090909' : '#aad3df'"
    dashArray=""
    :fillOpacity="1"
    :fillColor="store.isDark ? '#090909' : '#aad3df'"
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
    :fillColor="store.isDark ? '#090909' : '#aad3df'"
  >
  </l-polygon>
  <!-- Polygon che text "South China Sea" từ tile OSM -->
  <l-polygon
    :lat-lngs="[[15.9191, 114.4116], [15.496, 114.4336], [14.9236, 114.4116], [14.3708, 114.4556], [14.1579, 114.917], [14.2005, 115.4663], [15.0721, 115.73], [15.4537, 115.6421], [15.8134, 115.5762], [15.9613, 115.0708], [15.9613, 114.6973]]"
    :fillColor="store.isDark ? '#262626' : '#aad3df'"
    :fillOpacity="1"
    :color="store.isDark ? '#262626' : '#aad3df'"
    :weight="0"
  />

  <l-marker :visible="zoom >= 3" :lat-lng="[13.5, 113.5]">
    <l-icon :icon-size="[150, 40]" :icon-anchor="[75, 20]" className="bg-transparent">
      <div class="text-[#5a8a9f] text-center text-sm italic">
        {{ t('map.eastSea') }}
      </div>
    </l-icon>
  </l-marker>

  <l-marker :visible="zoom >= 4" :lat-lng="[16.5, 113]">
    <l-icon :icon-size="[150, 30]" :icon-anchor="[75, 15]" className="bg-transparent">
      <div class="text-[#777877]">
        {{ t('map.hoangSa.line1') }}<br />
        {{ t('map.hoangSa.line2') }}
      </div>
    </l-icon>
  </l-marker>

  <l-marker :visible="zoom >= 4" :lat-lng="[9.5, 115.5]">
    <l-icon :icon-size="[180, 30]" :icon-anchor="[90, 15]" className="bg-transparent">
      <div class="text-[#777877]">
        {{ t('map.truongSa.line1') }}<br />
        {{ t('map.truongSa.line2') }}
      </div>
    </l-icon>
  </l-marker>
</template>
<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import openstreetmap from '@/assets/map/openstreetmap.json'
import { LPolygon, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import { useAppStore } from '@/store/modules/app'

const { t } = useLang()

defineProps({
  zoom: { type: Number, default: 6 },
})

const store = useAppStore()

</script>
