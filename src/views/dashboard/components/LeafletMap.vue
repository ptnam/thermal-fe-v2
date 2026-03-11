<template>
  <div v-loading="loadingMap" class="h-full">
    <l-map
        ref="mapRef"
        class="rounded"
        :zoom="zoom"
        :center="mapType === MAP_TYPE_PICTURE ? imageCenter : [latitude, longitude]"
        :useGlobalLeaflet="true"
        :zoom-snap="0.01"
        @ready="onMapLoad"
        :crs="mapType === MAP_TYPE_PICTURE ? crs : null"
        @update:zoom="onZoomChange"
        v-bind="$attrs"
        :options="{zoomControl: false}"

    >
      <!-- Base map -->
      <l-tile-layer
         :key="tileKey"
          v-if="mapType === MAP_TYPE_MAP"
          :opacity="mapType === MAP_TYPE_MAP ? 1 : 0"
         :url="tile.url"
         :attribution="tile.attribution"
          layer-type="base"
      />

      <!-- Image overlay -->
      <l-image-overlay
          v-if="mapType === MAP_TYPE_PICTURE && photoPath"
          :opacity="mapType === MAP_TYPE_PICTURE ? 1 : 0"
          :url="photoPath"
          :cross-origin="false"
          :bounds="bounds"
      />
      <slot></slot>
      <islands v-if="mapType === MAP_TYPE_MAP" :zoom="zoomValue" />
    </l-map>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch} from 'vue'
import {LMap, LTileLayer, LImageOverlay} from '@vue-leaflet/vue-leaflet'
import {MAP_TYPE_MAP, MAP_TYPE_PICTURE} from '@/constants'

import {CRS} from 'leaflet'
import {useImageBounds} from "@/hooks/web/useImageBounds";
import Islands from '@/components/Map/islands.vue'
import { useAppStore } from '@/store/modules/app'

const crs = CRS.Simple

const props = defineProps({
  zoom: {type: Number, default: 6},
  latitude: {type: Number, default: 21.0173},
  longitude: {type: Number, default: 105.8545},
  photoPath: {type: [String, null], required: true},
  mapType: {type: String, required: true},
})
const appStore = useAppStore()
const isDark = computed(() => appStore.theme === 'dark')
const mapRef = ref<InstanceType<typeof LMap> | null>(null)


const tile = computed(() => {
  if (isDark.value) {
    return {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }
  }
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  }
})

const tileKey = computed(() => (isDark.value ? 'base_dark' : 'base_light'))

const loadingMap = ref(true)

const onMapLoad = () => {
  loadingMap.value = false
}

const zoomValue = ref(props.zoom)
function onZoomChange(newZoom: number) {
  zoomValue.value = newZoom
}

const flyToPoint = () => {
  mapRef.value?.leafletObject?.flyTo([props.latitude, props.longitude], props.zoom)
}

const {imageCenter, bounds, updateBound} = useImageBounds()

watch(
    () => props.photoPath,
    (path) => {
      if (!path) return
      updateBound(path)
    },
    {immediate: true},
)

watch(bounds, async (newBounds) => {
  if (
      props.mapType === MAP_TYPE_PICTURE &&
      newBounds
  ) {
    await nextTick()

    // Delay to ensure image overlay has rendered
    setTimeout(() => {
      const map = mapRef.value?.leafletObject
      if (map && newBounds) {
        map.fitBounds(newBounds, {
          padding: [10, 10],
          animate: false
        })
      }
    }, 100)
  }
})

defineExpose({flyToPoint})
</script>
