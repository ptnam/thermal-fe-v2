<template>
  <p></p>
</template>
<!--<template>-->
<!--  <l-circle-marker-->
<!--      v-for="camera in devices"-->
<!--      :key="camera.id"-->
<!--      :lat-lng="[camera.lat, camera.lng]"-->
<!--      :icon="camera.blink && camera.blink == 1 ? icon.camOff : icon.camOn"-->
<!--      @click="emitPoints(camera.id)"-->
<!--  >-->
<!--    <l-tooltip>-->
<!--      <div-->
<!--          class="custom-bcard"-->
<!--          :class="{-->
<!--              'bg-danger': camera.blink && camera.blink == 1,-->
<!--              'bg-success': !camera.blink || camera.blink == 0,-->
<!--            }"-->
<!--      >-->
<!--        <h5 class="camera-title">{{ camera.name }}</h5>-->
<!--        <div class="temperature-container">-->
<!--              <span-->
<!--                  v-for="(point, index) in lstPonintMaxTemp[camera.id].slice(-->
<!--                  0,-->
<!--                  3-->
<!--                )"-->
<!--                  :key="index"-->
<!--                  class="temp-value"-->
<!--              >-->
<!--                <i class="fa fa-thermometer-half"></i>-->
<!--                {{ point.tempCurrent }}°C-->
<!--              </span>-->
<!--        </div>-->
<!--      </div>-->
<!--    </l-tooltip>-->
<!--  </l-circle-marker>-->
<!--</template>-->
<!--<script setup lang="ts">-->
<!--import {LCircleMarker, LTooltip} from "@vue-leaflet/vue-leaflet";-->
<!--import {Device} from "@/api/dashboard/analysis/types";-->
<!--defineProps<{-->
<!--  devices: Device[]-->
<!--}>()-->
<!--</script>-->