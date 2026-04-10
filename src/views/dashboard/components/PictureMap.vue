<template>
  <div v-loading="loadingMap" class="h-full">
    <l-map
        ref="mapRef"
        :zoom="zoom"
        :center="[latitude, longitude]"
        :useGlobalLeaflet="true"
        @ready="onMapLoad"
        v-bind="$attrs"
    >
      <!-- Base map -->
      <l-tile-layer
          :opacity="mapType === MAP_TYPE_MAP ? 1 : 0"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
      />

      <!-- Image overlay -->
      <l-image-overlay
          :opacity="mapType === MAP_TYPE_PICTURE? 1 : 0"
          :url="photoPath"
          :crossOrigin="false"
          :bounds="bounds"
      />

      <!-- Marker -->
      <l-marker
          v-if="latitude !== null && longitude !== null"
          :lat-lng="[latitude, longitude]"
      />
    </l-map>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import L from 'leaflet'
import {
  LImageOverlay,
  LMap,
  LMarker,
  LTileLayer,
} from '@vue-leaflet/vue-leaflet'
import {MAP_TYPE_MAP, MAP_TYPE_PICTURE} from '@/constants'

// Props
const props = defineProps({
  zoom: {
    type: Number,
    default: 6,
  },
  latitude: {
    type: Number,
    default: 21.0173,
  },
  longitude: {
    type: Number,
    default: 105.8545,
  },
  photoPath: {
    type: String,
    required: true,
  },
  mapType: {
    type: String,
    required: true,
  },
})

// Refs and state
const mapRef = ref()
const bounds = ref<L.LatLngBounds>([[-60, -150],
  [60, 150]])
const loadingMap = ref(true)

// Map load handler
const onMapLoad = () => {
  loadingMap.value = false
}

// Method to expose to parent
const flyToPoint = () => {
  debugger
  mapRef.value?.leafletObject?.flyTo(
      [props.latitude, props.longitude],
      props.zoom
  )
}

defineExpose({
  flyToPoint,
})
</script>