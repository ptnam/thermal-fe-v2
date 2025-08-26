<template>
  <div class="card p-4">
    <p v-if="marker" :class="[liveTemperature.level ? '' : 'text-black', 'text-center text-lg']">{{
        marker.deviceTypeName
      }}: {{ marker.name }}</p>
    <div v-for="(items, index) in thermalInfo" :key="index">
      <p class="font-bold"><span class="text-xl">{{ index }}</span></p>
      <div>
        <div v-for="item in items" class="text-base">
          <p v-if="marker?.deviceType ==='Sensor'">
            {{ item?.monitorPointCode }} Nhiệt độ: <span class="font-bold">{{ item.temperature }}</span>
          </p>
          <p v-else>{{ item?.monitorPointCode }}:
            Min: <span class="font-bold">{{ item.minTemperature }}</span>
            Max: <span class="font-bold">{{ item.maxTemperature }}</span>
            Ave: <span class="font-bold">{{ item.aveTemperature }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps({
  liveTemperature: {
    type: Object,
    default: {},
  },
  marker: {
    type: [Object, null],
    default: {},
  },
  thermalInfo: {
    type: [Object],
    default: {},
  }
})
</script>