<template>
  <l-marker :lat-lng="latLng" :icon="currentIcon">
    <slot></slot>
  </l-marker>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {LMarker} from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

// Props
const props = defineProps({
  latLng: {
    type: Array,
    required: true,
  },
  iconPath: {
    type: String,
    required: false,
  },
  isBlink: {
    type: Boolean,
    default: false,
  },
})
// Reactive state
const currentIcon = ref(null)

function createIcon(path, isBlink = false) {
  return L.icon({
    iconUrl: path,
    iconSize: [30, 30],
    iconAnchor: [10, 10],
    tooltipAnchor: [0, -10],
    className: isBlink ? 'blink' : ''
  })
}

// Lifecycle
onMounted(() => {
  currentIcon.value = createIcon(props.iconPath, props.isBlink)
})

</script>
<style lang="scss">
.blink {
  animation: blink 0.3s infinite;
}

:global {
  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
}
</style>