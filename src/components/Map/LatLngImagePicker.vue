<template>
  <LatLngPicker
      ref="latLngPickerRef"
      longitudeLabel="Tọa độ X"
      latitudeLabel="Tọa độ Y"
      buttonText="Chọn tọa độ trên ảnh"
      :map-config="mapConfig"
      :crs="crs"
      :mapType="MAP_TYPE_PICTURE"
      :update-center="false"
  >
    <l-image-overlay class="" :url="imagePath" :crossOrigin="false" :bounds="bounds"></l-image-overlay>
  </LatLngPicker>
</template>

<script setup>
import {ref, watch, nextTick} from 'vue'
import LatLngPicker from '@/components/Map/LatLngPicker.vue'
import {LImageOverlay} from '@vue-leaflet/vue-leaflet'

import {CRS} from 'leaflet'
import {useImageBounds} from "@/hooks/web/useImageBounds.js";
import { MAP_TYPE_PICTURE } from '@/constants/index.js'

const crs = CRS.Simple
const props = defineProps({
  imagePath: {type: String, required: true},
  mapConfig: {
    type: Object,
    default: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
    },
  },
})
const latLngPickerRef = ref()
const {imageCenter, bounds, updateBound} = useImageBounds()
watch(
    () => props.imagePath,
    (path) => {
      if (!path) return
      updateBound(path)
    },
    {immediate: true},
)
watch(
    () => imageCenter.value,
    (newVal) => {
      if (latLngPickerRef?.value && newVal) {
        latLngPickerRef.value.updateCenterValue(newVal)
      }
    },
    {immediate: true}
)
</script>
