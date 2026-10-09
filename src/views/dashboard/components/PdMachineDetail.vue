<template>
  <div>
    <div class="node-popup-header">
      <span>{{ t('dashboard.equipment') }}: {{ machine?.name }}</span>
    </div>
    <div class="node-popup-body">
      <p v-if="loading" class="empty-text">{{ t('dashboard.loading') }}</p>
      <p v-else-if="stale" class="empty-text">{{ t('dashboard.noRecentData') }}</p>
      <div v-else-if="components && components.length" class="node-popup-grid grid grid-cols-1 lg:grid-cols-2 gap-[15px]">
        <div v-for="item in components" :key="item.machineComponentId" class="analysis-card">
          <div class="analysis-title">
            <span>{{ item.machineComponentName }}</span>
            <span
                v-if="item.lastEvaluationLevelObject"
                class="pd-badge"
                :class="`pd-badge--${item.lastEvaluationLevelObject.code}`"
            >{{ item.lastEvaluationLevelObject.name }}</span>
          </div>

          <template v-if="item.lastEvaluationLevelObject">
            <div class="analysis-row">
              <div class="analysis-label">{{ t('dashboard.measuredIntensity') }}</div>
              <div class="analysis-val">
                {{ item.lastLevelDb }} dB
                <template v-if="isLevelDbCriteria(item) && item.thresholdGoodMax != null">
                  / <span class="pd-good-threshold">{{ item.thresholdGoodMax }} dB</span>
                </template>
              </div>
            </div>
            <!-- ΔPD% chỉ hiện với bộ phận chấm theo ΔPD% (không phải theo ngưỡng dB). -->
            <div v-if="isGrowthRateCriteria(item)" class="analysis-row">
              <div class="analysis-label">{{ t('dashboard.growthRate') }}</div>
              <div class="analysis-val">
                {{ item.lastDeltaPdPercent ?? '—' }}%
                <template v-if="item.thresholdGoodMax != null">
                  / <span class="pd-good-threshold">{{ item.thresholdGoodMax }}%</span>
                </template>
              </div>
            </div>
            <div class="analysis-row">
              <div class="analysis-label">Camera</div>
              <div class="analysis-val">{{ item.cameraCode || '—' }}</div>
            </div>
            <div class="analysis-row">
              <div class="analysis-label">{{ t('dashboard.cameraZone') }}</div>
              <div class="analysis-val">{{ item.zoneName || '—' }}</div>
            </div>
            <div class="analysis-row">
              <div class="analysis-label">{{ t('dashboard.lastMeasured') }}</div>
              <div class="analysis-val">{{ item.lastReadAt }}</div>
            </div>
          </template>
          <p v-else class="empty-text">{{ t('dashboard.noPdData') }}</p>
        </div>
      </div>
      <p v-else class="empty-text">{{ t('dashboard.noPdZones') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'

const { t } = useLang()
// Nội dung chi tiết marker PD trên dashboard - dùng chung khung .node-popup-*/.analysis-* với ThermalData.vue
// (bảng chi tiết nhiệt độ) để đồng nhất giao diện, chỉ khác nội dung từng dòng.
defineProps<{
  machine: { name?: string } | null
  components: any[]
  loading?: boolean
  stale?: boolean
}>()

// evaluationThresholdType: 7 = ΔPD%, 8 = ngưỡng dB; thresholdGoodMax là ngưỡng "Tốt" đã áp dụng (đơn vị theo tiêu chí).
const THRESHOLD_TYPE_PD_GROWTH_RATE = 7
const THRESHOLD_TYPE_PD_LEVEL_DB = 8
const isGrowthRateCriteria = (item: any) => item.evaluationThresholdType === THRESHOLD_TYPE_PD_GROWTH_RATE
const isLevelDbCriteria = (item: any) => item.evaluationThresholdType === THRESHOLD_TYPE_PD_LEVEL_DB
</script>

<style scoped>
.node-popup-header {
  background: var(--bg-body);
  padding: 16px 20px;
  margin-bottom: 16px;
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-popup-body {
  color: var(--text-main);
  max-height: 70vh;
  overflow-y: auto;
}

.analysis-card {
  background: var(--bg-body);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  transition: 0.2s;
}

.analysis-card:hover {
  border-color: var(--primary);
}

.analysis-title {
  font-weight: 700;
  color: var(--text-main);
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
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

.pd-good-threshold {
  color: var(--success);
  font-weight: 700;
}

.empty-text {
  font-size: 0.8125rem;
  color: var(--text-sub);
  margin: 0;
}

.pd-badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: inherit;
}

.pd-badge--Good { background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); }
.pd-badge--Fair { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }
.pd-badge--Average { background: color-mix(in srgb, var(--warning) 14%, transparent); color: var(--warning); }
.pd-badge--Bad { background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger); }
.pd-badge--Undefined { background: var(--bg-card); color: var(--text-sub); }
</style>
