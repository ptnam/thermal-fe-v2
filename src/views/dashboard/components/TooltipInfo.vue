<template>
  <div class="node-popup">
    <div class="node-popup-header">
      <el-text size="large">{{ marker.deviceTypeName }}: {{ marker.name }}</el-text>
    </div>
    <div class="node-popup-body">
      <div id="popupContentArea">
        <div v-for="(items, index) in thermalInfo" :key="index" class="node-popup-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div v-for="item in items"  class="analysis-card">
            <div class="analysis-title">
              <el-text>{{ item?.monitorPointCode }}</el-text>
            </div>
            <div style="font-size:11px; color:var(--text-main); margin-bottom:10px; background:var(--bg-card); padding:6px 10px; border-radius:6px; border: 1px solid var(--border)">
                <div v-if="marker?.deviceType ==='Sensor'">
                  <span style="opacity:0.6">Nhiệt độ::</span> <b style="color:var(--warning)">{{ item.temperature }}°C</b>
                </div>
                <div v-else>
                  <span style="opacity:0.6">Min:</span> <b style="color:var(--success)">{{ item.minTemperature }}°C</b> |
                  <span style="opacity:0.6">Ave:</span> <b style="color:var(--warning)">{{ item.aveTemperature }}°C</b> |
                  <span style="opacity:0.6">Max:</span> <b style="color:var(--danger)">{{ item.maxTemperature }}°C</b>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps({
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