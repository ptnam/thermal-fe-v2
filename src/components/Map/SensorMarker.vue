<template>
  <l-marker :lat-lng="latLng" :icon="currentIcon">
    <slot></slot>
  </l-marker>
</template>

<script setup>
import {watch, ref, onMounted} from 'vue'
import {LMarker} from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import {buildSensorMarkerIcon} from '@/utils/sensorMarkerIcon'
// Props
const props = defineProps({
  latLng: {
    type: Array,
    required: true,
  },
  iconColor: {
    type: String,
    default: '#dd0c44', // default red
  },
  isBlink: {
    type: Boolean,
    default: false,
  },
  iconVariant: {
    type: String,
    default: 'default',
  },
})

// Reactive state
const currentIcon = ref(null)

function createIcon() {
  const icon = buildSensorMarkerIcon({
    iconColor: props.iconColor,
    isBlink: props.isBlink,
    iconVariant: props.iconVariant,
  })
  return L.divIcon({
    html: icon.html,
    className: icon.className,
    iconSize: icon.size,
    iconAnchor: icon.anchor,
  })
}

watch(
    () => [props.iconColor, props.iconVariant, props.isBlink],
    () => {
      currentIcon.value = createIcon()
    },
    {immediate: true}
)

onMounted(() => {
  currentIcon.value = createIcon()
})
</script>

<style lang="scss">
.blink {
  animation: blink 0.6s infinite;
}

.pd-icon-wrapper {
  background: transparent;
  border: 0;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35));
}

:global {
  @keyframes blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
}
</style>
