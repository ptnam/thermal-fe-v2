<template>
  <PdWidgetCard v-loading="loading">
    <template #title>{{ t('pd.resolution.title') }}</template>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-box__label">{{ t('pd.resolution.total') }}</div>
        <div class="stat-box__value">{{ total }}</div>
      </div>
      <div class="stat-box stat-box--danger">
        <div class="stat-box__label">{{ t('pd.resolution.pending') }}</div>
        <div class="stat-box__value">{{ stats.pendingCount }}</div>
      </div>
      <div class="stat-box stat-box--success">
        <div class="stat-box__label">{{ t('pd.resolution.resolved') }}</div>
        <div class="stat-box__value">{{ stats.resolvedCount }}</div>
      </div>
      <div class="stat-box">
        <div class="stat-box__label">{{ t('pd.resolution.avgTime') }}</div>
        <div class="stat-box__value">{{ formattedAvgTime }}</div>
      </div>
    </div>

    <div class="progress-row">
      <div class="progress-row__label">
        {{ t('pd.resolution.resolvedRate') }}
        <strong>{{ resolvedPercent }}%</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" :style="{ width: `${resolvedPercent}%` }" />
      </div>
    </div>
  </PdWidgetCard>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import PdWidgetCard from './PdWidgetCard.vue'
import { notificationResolutionStatsApi } from '@/api/notification'
import { computed, watch, ref } from 'vue'

const { t } = useLang()

// Widget "Tỷ lệ xử lý cảnh báo" (tab Thống kê Phóng điện vượt ngưỡng) - đo hiệu quả xử lý (không chỉ đo thiết
// bị như 2 widget kia): bao nhiêu % cảnh báo đã xử lý, xử lý mất trung bình bao lâu.
// Khu vực/khoảng thời gian dùng chung bộ lọc của cả tab (pd-summary.vue), không còn filter riêng.
const PD_WARNING_EVENT_CODE = 'PD_EXCEEDED'

const props = defineProps<{
  areaId: number | null
  startDate: string
  endDate: string
}>()

const loading = ref(false)
const stats = ref({ pendingCount: 0, resolvedCount: 0, avgResolutionMinutes: null as number | null })

const total = computed(() => stats.value.pendingCount + stats.value.resolvedCount)
const resolvedPercent = computed(() => (total.value > 0 ? Math.round((stats.value.resolvedCount / total.value) * 100) : 0))
const formattedAvgTime = computed(() => {
  const minutes = stats.value.avgResolutionMinutes
  if (minutes == null) return '—'
  if (minutes < 60) return t('pd.resolution.minutes', { n: minutes })
  const hours = Math.floor(minutes / 60)
  const remain = Math.round(minutes % 60)
  return t('pd.resolution.hours', { n: hours }) + (remain ? ' ' + t('pd.resolution.minutes', { n: remain }) : '')
})

async function load() {
  loading.value = true
  try {
    const res = await notificationResolutionStatsApi({
      startDate: props.startDate,
      endDate: props.endDate,
      warningEventCode: PD_WARNING_EVENT_CODE,
      areaId: props.areaId ?? undefined,
    })
    stats.value = res.data as any
  } finally {
    loading.value = false
  }
}

watch(() => [props.areaId, props.startDate, props.endDate], load, { immediate: true })
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-box {
  background: var(--bg-body);
  border-radius: 10px;
  padding: 14px 16px;
}

.stat-box--danger {
  background: color-mix(in srgb, var(--danger) 10%, transparent);
}
.stat-box--danger .stat-box__value {
  color: var(--danger);
}

.stat-box--success {
  background: color-mix(in srgb, var(--success) 10%, transparent);
}
.stat-box--success .stat-box__value {
  color: var(--success);
}

.stat-box__label {
  font-size: 0.75rem;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.stat-box__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
}

.progress-row {
  margin-top: 18px;
}

.progress-row__label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--text-sub);
  margin-bottom: 6px;
}

.progress-row__label strong {
  color: var(--success);
  font-weight: 700;
}

.progress-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  border-radius: 999px;
  background: var(--success);
  transition: width 0.3s ease;
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
