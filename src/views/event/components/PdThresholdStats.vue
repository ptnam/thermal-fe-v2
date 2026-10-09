<template>
  <PdWidgetCard>
    <template #title>{{ t('pd.alertsByDay') }}</template>
    <VueApexChart
        ref="chartBarRef"
        type="area"
        height="480"
        :options="chartOptions"
        :series="series"
    />
  </PdWidgetCard>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import { computed, ref, watch } from 'vue'
import { notificationsCountApi } from '@/api/notification'
import PdWidgetCard from './PdWidgetCard.vue'
import { useChartTheme } from './useChartTheme'
import VueApexChart from 'vue3-apexcharts'

const { t } = useLang()

// Widget "Số lượng cảnh báo theo ngày" (tab Thống kê Phóng điện vượt ngưỡng, màn Tổng hợp phóng điện) - tham khảo
// ThresholdWarning.vue (Tổng hợp dữ liệu nhiệt độ, /event/home) nhưng khoá cứng warningEventCode =
// PD_EXCEEDED (BE: NotificationsController.GetCount đã hỗ trợ lọc theo loại cảnh báo).
// Khu vực/khoảng thời gian dùng chung bộ lọc của cả tab (pd-summary.vue), không còn filter riêng.
const PD_WARNING_EVENT_CODE = 'PD_EXCEEDED'

const props = defineProps<{
  areaId: number | null
  startDate: string
  endDate: string
}>()

const { axisTextColor, gridColor, legendTextColor, tooltipTheme } = useChartTheme()

const categories = ref<string[]>([])

// Style tham khảo PdLevelLog.vue (Nhật ký phóng điện theo điểm đo) - đường mượt (smooth), fill nhạt,
// marker chỉ hiện khi hover, legend dưới đáy - thay cho style area/marker cứng trước đây. chartOptions
// phải là computed để đổi màu chữ/lưới theo dark/light - ApexCharts vẽ chữ bằng màu cứng, không tự
// theo CSS var(--text-*) như khung card.
const chartOptions = computed(() => ({
  chart: {
    height: 480,
    type: 'area',
    toolbar: { show: true },
    zoom: { enabled: true, allowMouseWheelZoom: false },
  },
  colors: ['#2563eb'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  markers: { size: 0, hover: { sizeOffset: 6 } },
  fill: { type: 'solid', opacity: 0.35 },
  grid: { borderColor: gridColor.value },
  xaxis: {
    categories: categories.value,
    title: { text: t('alert.date'), style: { color: axisTextColor.value, fontSize: '12px' } },
    labels: { style: { colors: axisTextColor.value } },
  },
  yaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    allowDecimals: false,
    labels: { show: true, style: { colors: axisTextColor.value } },
    title: { text: t('alert.stats.alertCount'), style: { color: axisTextColor.value, fontSize: '12px' } },
  },
  legend: { position: 'bottom', labels: { colors: legendTextColor.value } },
  tooltip: { theme: tooltipTheme.value },
  noData: { text: t('pd.noData'), style: { color: axisTextColor.value } },
}))
const series = ref<{ name: string; data: number[] }[]>([{ name: t('alert.stats.alertCount'), data: [] }])

const chartBarRef = ref<ApexCharts>()

const refresh = () => {
  notificationsCountApi({
    startDate: props.startDate,
    endDate: props.endDate,
    warningEventCode: PD_WARNING_EVENT_CODE,
    areaId: props.areaId ?? undefined,
  }).then((res: any) => {
    const seriesData: number[] = []
    const categoryLabel: string[] = []
    for (const item of res.data as { numberOfNotifications: number; dataDate: string }[]) {
      seriesData.push(item.numberOfNotifications)
      categoryLabel.push(item.dataDate)
    }
    series.value = [{ name: t('alert.stats.alertCount'), data: seriesData }]
    categories.value = categoryLabel
    chartBarRef.value?.updateSeries(series.value, true)
  })
}

watch(() => [props.areaId, props.startDate, props.endDate], refresh, { immediate: true })
</script>
