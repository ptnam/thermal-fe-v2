<template>
  <div id="deviceNodePopup" style="display: block;">
    <div class="node-popup-header">
      <span>Thiết bị: <span id="popupDeviceTitle">{{ marker?.name }}</span></span>
    </div>
    <div class="node-popup-body">
      <!-- Content will be populated by JS -->
      <div id="popupContentArea">
        <div class="node-popup-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div v-for="(items, index) in thermalInfo" class="analysis-card">
            <div class="analysis-title">
              <span>{{ index }}</span>
              <span style="font-size:10px; color:var(--text-sub)"></span>
            </div>
            <div v-for="item in items">
              <div
                  style="font-size:11px; color:var(--text-main); margin-bottom:10px; background:var(--bg-card); padding:6px 10px; border-radius:6px; border: 1px solid var(--border)">
                <span style="opacity:0.6">Min:</span> <b style="color:var(--success)">{{ item?.minTemperature }}°C</b> |
                <span style="opacity:0.6">Max:</span> <b style="color:var(--danger)">{{ item?.maxTemperature }}°C</b>
              </div>
              <div v-for="data in item?.dicThermalDataResults" class="analysis-row">
                <div class="analysis-label">{{ data.compareTypeObject.name }}</div>
                <div class="analysis-val">{{ data.compareValue }} / <span
                    :class="['status-pill', data.compareResultObject.code === 'Bad' ? 'text-red-600' : 'text-green-500']"> {{
                    data.compareResultObject.name
                  }}</span></div>
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
<style scoped>

/* Interactive Node Popup - Premium Style */
.node-popup {
  position: absolute;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  width: 800px;
  max-width: 95vw;
  z-index: 10000;
  padding: 0;
  overflow: hidden;
  color: var(--text-main);
  display: none;
  font-family: 'Inter', sans-serif;
  pointer-events: auto;
  border: 1px solid var(--border);
  animation: popupFadeIn 0.2s ease-out;
  backdrop-filter: blur(10px);
}

@keyframes popupFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.node-popup-header {
  background: var(--bg-body);
  /* Theme-aware subtle header */
  padding: 16px 20px;
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
  color: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-popup-close {
  cursor: pointer;
  color: var(--text-sub);
  font-size: 20px;
  transition: 0.2s;
  line-height: 1;
}

.node-popup-close:hover {
  color: var(--danger);
  transform: scale(1.1);
}

.node-popup-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  background: var(--bg-card);
}


/* Analysis Card Style - Premium Unified */
.analysis-card {
  background: var(--bg-body);
  /* Use body bg for inner cards for contrast */
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  transition: 0.2s;
}

.analysis-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.analysis-title {
  font-weight: 700;
  color: var(--text-main);
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-sub);
}

.analysis-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.analysis-label {
  font-weight: 500;
}

.analysis-val {
  color: var(--text-main);
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

</style>