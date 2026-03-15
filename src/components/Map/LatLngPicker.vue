<template>
  <div>
    <el-button @click="toggleModal" color="#F9CD37">{{ buttonText }}</el-button>

    <el-dialog
        v-model="modalShow"
        :destroy-on-close="true"
        top="5vh"
        :append-to-body="true"
        center
        align-center
        width="80%"
    >
      <template #default>
        <!-- Coordinate Toggle Button -->
        <div class="position-absolute fixed-modal-bottom">
          <el-button class="btn-custom" type="success" @click="toggleCoordinates">
            <el-icon>
              <LocationInformation/>
            </el-icon>
          </el-button>
        </div>

        <!-- Coordinate Panel -->
        <div class="position-absolute fixed-modal-bottom bg-white">
          <el-card v-if="coordinateShow" class="mb-2" style="min-width: 16rem" header="Tọa độ">
            <el-form label-position="left" label-width="auto">
              <el-form-item :label="longitudeLabel">
                <el-input v-model="marker.longitude" type="number" step="0.0001"/>
              </el-form-item>
              <el-form-item :label="latitudeLabel">
                <el-input v-model="marker.latitude" type="number" step="0.0001"/>
              </el-form-item>
              <el-form-item label="Zoom">
                <el-input
                    v-model="zoomValue"
                    :disabled="disableZoom"
                    type="number"
                    step="0.1"
                    min="0"
                    max="18"
                    @input="updateZoom"
                />
              </el-form-item>
            </el-form>
            <el-button @click="coordinateShow = false">Ẩn</el-button>
            <el-button type="success" @click="save">Lưu</el-button>
          </el-card>
        </div>
        <l-map
            ref="mapRef"
            class="rounded"
            style="height: 80vh"
            :zoom="zoomValue"
            :center="mapCenter"
            :zoom-snap="0.01"
            @click="handleMapClick"
            @zoom="updateZoomValue"
            v-bind="$attrs"
        >
          <slot>
            <l-tile-layer
                layer-type="base"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </slot>
          <l-marker
              v-if="marker.latitude && marker.longitude"
              :lat-lng="[marker.latitude, marker.longitude]"
          />
          <islands v-if="mapType === MAP_TYPE_MAP" :zoom="zoomValue" />
        </l-map>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import {onMounted, ref} from 'vue'
import {LMap, LTileLayer, LMarker} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import {LocationInformation} from '@element-plus/icons-vue'
import Islands from '@/components/Map/islands.vue'
import { MAP_TYPE_MAP } from '@/constants/index.js'

const props = defineProps({
  buttonText: {
    type: String,
    default: () => 'Chọn tọa độ trên bản đồ',
  },
  longitudeLabel: {
    type: String,
    default: 'Kinh độ',
  },
  latitudeLabel: {
    type: String,
    default: 'Vĩ độ',
  },
  mapType: {
    type: String,
    default: MAP_TYPE_MAP,
  },
  mapConfig: {
    type: Object,
    default: {
      latitude: 21.0173,
      longitude: 105.8545,
      zoom: 6,
      bounds: [],
      opacity: 1,
    },
  },
  updateCenter: {
    type: Boolean,
    default: true,
  },
  disableZoom: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['input'])

const mapRef = ref(null)
const modalShow = ref(false)
const coordinateShow = ref(true)

const zoomValue = ref(0)

const marker = ref({})

const mapCenter = ref([])

const refresh = () => {
  zoomValue.value = props.mapConfig.zoom ?? 0
  marker.value = {
    latitude: props.mapConfig.latitude,
    longitude: props.mapConfig.longitude,
  }
  if (props.updateCenter) {
    mapCenter.value = [props.mapConfig.latitude ?? 21.0173, props.mapConfig.longitude ?? 105.8545]
  }
}

onMounted(() => {
  refresh()
})

function toggleModal() {
  modalShow.value = !modalShow.value
}

function toggleCoordinates() {
  coordinateShow.value = !coordinateShow.value
}

function handleMapClick(e) {
  // Update marker lat and lng based on map click
  const newLat = parseFloat(e.latlng.lat.toFixed(5))
  const newLng = parseFloat(e.latlng.lng.toFixed(5))
  // Emit the new values to the parent component
  marker.value = {
    latitude: newLat,
    longitude: newLng,
  }
  if (props.updateCenter) {
    mapCenter.value = [newLat, newLng]
  }
}

function updateZoom() {
  emit('input', {
    zoom: zoomValue.value,
  })
}

function updateZoomValue(e) {
  zoomValue.value = e.target._zoom
}

function updateCenterValue(newCenter) {
  mapCenter.value = newCenter
}

function save() {
  emit('input', {
    latitude: marker.value.latitude,
    longitude: marker.value.longitude,
    zoom: zoomValue.value,
  })
  modalShow.value = false
}

defineExpose({
  refresh,
  updateCenterValue
})
</script>

<style scoped lang="scss">
.btn-custom {
  &.el-button--danger {
    width: initial !important;
  }
}

.fixed-modal-bottom {
  margin: 10px;
  bottom: 0;
  z-index: 1000;
  width: 15%;
  position: absolute;
}
</style>
