<template>
  <div class="border p-0.5 text-[14px]">
    <div v-if="thermalInfo">
      <div v-for="(items, index) in thermalInfo" class="border-1 p-0.5">
        <p><span class="text-[#486DC5] font-bold">Bộ phận</span>: <span class="font-bold text-xl">{{
            index
          }}</span></p>
        <div v-for="item in items">
          <p>
            <span class="text-green-500">{{ item.monitorPointCode }}: </span>
            <span>Min</span>: <span class="font-bold">{{ item.minTemperature }}</span>
            <span class="pl-2">Max</span>: <span class="font-bold">{{ item.maxTemperature }}</span>
            <span class="pl-2">Ave</span>: <span class="font-bold">{{ item.aveTemperature }}</span>
          </p>
          <div v-for="data in item.dicThermalDataResults" class="border-y-1 border-dashed p-0.5">
            <p class="font-bold">{{ data.compareTypeObject.name }}</p>
            <p><span>Nhiệt độ</span>: <span class="font-bold">{{ data.compareValue }}</span></p>
            <p><span>Lệch</span>: <span class="font-bold">{{ data.deltaValue }}</span></p>
            <p><span>Đánh giá</span>:
              <span
                  :class="['font-bold', data.compareResultObject.code === 'Bad' ? 'text-red-600' : 'text-green-500']">
              {{ data.compareResultObject.name }}
            </span>
            </p>
            <div v-if="data && data.comparationThermalData">
              <p class="text-[#486DC5]">
                Pha min: {{ data.comparationThermalData.comparationComponentName }}
              </p>
              <p>
                <span>Min</span>: <span class="font-bold">{{ data.comparationThermalData.minTemperature }}</span>
                <span class="pl-2">Max</span>: <span class="font-bold">{{
                  data.comparationThermalData.maxTemperature
                }}</span>
                <span class="pl-2">Ave</span>: <span class="font-bold">{{
                  data.comparationThermalData.aveTemperature
                }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p v-if="marker"><span>Bộ phận</span>: <span class="font-bold">{{ marker.deviceType }}: {{ marker.name }}</span>
      </p>
      <div class="border-1 p-0.5">
        <p>Không có dữ liệu</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

defineProps({
  thermalInfo: {
    type: Object,
    default: {},
  },
  marker: {
    type: [Object, null],
    default: {},
  },
})
</script>