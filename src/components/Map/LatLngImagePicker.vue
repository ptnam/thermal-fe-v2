<template>
  <LatLngPicker
      ref="latLngPickerRef"
      :longitudeLabel="t('map.x')"
      :latitudeLabel="t('map.y')"
      :buttonText="buttonText ?? t('map.pickOnImage')"
      :map-config="{ ...mapConfig, zoom: 0 }"
      :crs="crs"
      :mapType="MAP_TYPE_PICTURE"
      :update-center="false"
  >
    <l-image-overlay class="" :url="imagePath" :crossOrigin="false" :bounds="bounds"></l-image-overlay>
  </LatLngPicker>
</template>

<script setup>
import { useLang } from '@/hooks/web/useI18n'
import {ref, watch, nextTick} from 'vue'
import LatLngPicker from '@/components/Map/LatLngPicker.vue'
import {LImageOverlay} from '@vue-leaflet/vue-leaflet'

import {CRS} from 'leaflet'
import {useImageBounds} from "@/hooks/web/useImageBounds.js";
import { MAP_TYPE_PICTURE } from '@/constants/index.js'

const { t } = useLang()

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
  buttonText: {
    type: String,
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
