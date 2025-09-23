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
        style="height: 80vh"
        :crs="mapType === MAP_TYPE_PICTURE ? crs : null"
        v-bind="$attrs"
    >
      <!-- Base map -->
      <l-tile-layer
          v-if="mapType === MAP_TYPE_MAP"
          :opacity="mapType === MAP_TYPE_MAP ? 1 : 0"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
      <islands />
    </l-map>
  </div>
</template>

<script setup lang="ts">
import {nextTick, ref, watch} from 'vue'
import {LMap, LTileLayer, LImageOverlay} from '@vue-leaflet/vue-leaflet'
import {MAP_TYPE_MAP, MAP_TYPE_PICTURE} from '@/constants'

import {CRS} from 'leaflet'
import {useImageBounds} from "@/hooks/web/useImageBounds";
import Islands from '@/components/Map/islands.vue'

const crs = CRS.Simple

const props = defineProps({
  zoom: {type: Number, default: 6},
  latitude: {type: Number, default: 21.0173},
  longitude: {type: Number, default: 105.8545},
  photoPath: {type: [String, null], required: true},
  mapType: {type: String, required: true},
})

const mapRef = ref<InstanceType<typeof LMap> | null>(null)

const loadingMap = ref(true)

const onMapLoad = () => {
  loadingMap.value = false
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
