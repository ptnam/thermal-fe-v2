<template>
  <l-marker :lat-lng="latLng" :icon="currentIcon">
    <slot></slot>
  </l-marker>
</template>

<script setup>
import {watch, computed, ref, onMounted} from 'vue'
import {LMarker} from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
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
})

// Reactive state
const currentIcon = ref(null)

const svgHtml = computed(() => `<svg class="thermometer-icon" viewBox="0 0 24 24" fill="none" stroke="${props.iconColor}" stroke-width="2">
                                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                            </svg>`)

// Create Leaflet icon from either SVG or PNG
function createIcon() {
  return L.divIcon({
    html: svgHtml.value,
    className: props.isBlink ? 'blink' : '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

watch(
    () => props.iconColor,
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
