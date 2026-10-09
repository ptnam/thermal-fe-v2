<template>
  <PdWidgetCard v-loading="loading">
    <template #title>{{ t('pd.levelDistribution') }}</template>

    <VueApexChart v-if="series.length" type="donut" height="380" :options="chartOptions" :series="series" />
    <div v-else class="empty empty--fill">{{ t('pd.noAlertsInRange') }}</div>
  </PdWidgetCard>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import PdWidgetCard from './PdWidgetCard.vue'
import { notificationLevelDistributionApi } from '@/api/notification'
import { useChartTheme } from './useChartTheme'
import { computed, watch, ref } from 'vue'
import VueApexChart from 'vue3-apexcharts'

const { t } = useLang()

// Widget "Phân bố tình trạng cảnh báo" (tab Thống kê Phóng điện vượt ngưỡng) - trước đây là snapshot số bộ
// phận đang ở mỗi mức đánh giá hiện tại (PdComponentBaseline); nay đổi sang % CẢNH BÁO PD (Notification.
// CompareResult) theo từng mức trong khoảng thời gian đang lọc - dùng chung bộ lọc Khu vực/Khoảng thời
// gian của cả tab (pd-summary.vue). Chỉ hiện 3 mức Khá/Trung bình/Xấu - cảnh báo PD_EXCEEDED không phát
// sinh ở mức Tốt/Chưa đánh giá nên không cần hiện.
const PD_WARNING_EVENT_CODE = 'PD_EXCEEDED'

const LEVEL_META: Record<string, { labelKey: string; color: string }> = {
  Fair: { labelKey: 'pd.levels.fair', color: '#2563eb' },
  Average: { labelKey: 'pd.levels.average', color: '#d97706' },
  Bad: { labelKey: 'pd.levels.bad', color: '#dc2626' },
}

const props = defineProps<{
  areaId: number | null
  startDate: string
  endDate: string
}>()

interface DistributionItem {
  evaluationLevel?: number | null
  evaluationLevelObject?: { code: string; name: string } | null
  count: number
}

const loading = ref(false)
const items = ref<DistributionItem[]>([])
const { axisTextColor, legendTextColor, tooltipTheme } = useChartTheme()

const series = computed(() => items.value.map((i) => i.count))
const chartOptions = computed(() => ({
  labels: items.value.map((i) => {
    const key = LEVEL_META[i.evaluationLevelObject?.code ?? '']?.labelKey
    return key ? t(key) : i.evaluationLevelObject?.name ?? '—'
  }),
  colors: items.value.map((i) => LEVEL_META[i.evaluationLevelObject?.code ?? '']?.color ?? '#94a3b8'),
  legend: { position: 'bottom' as const, labels: { colors: legendTextColor.value } },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
  },
  tooltip: { theme: tooltipTheme.value },
  noData: { text: t('pd.noData'), style: { color: axisTextColor.value } },
}))

async function load() {
  loading.value = true
  try {
    const res = await notificationLevelDistributionApi({
      startDate: props.startDate,
      endDate: props.endDate,
      warningEventCode: PD_WARNING_EVENT_CODE,
      areaId: props.areaId ?? undefined,
    })
    items.value = ((res.data as DistributionItem[]) ?? []).filter(
      (i) => i.count > 0 && ['Fair', 'Average', 'Bad'].includes(i.evaluationLevelObject?.code ?? ''),
    )
  } finally {
    loading.value = false
  }
}

watch(() => [props.areaId, props.startDate, props.endDate], load, { immediate: true })
</script>

<style scoped>
.empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text-sub);
  font-size: 0.875rem;
}

.empty--fill {
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style>
