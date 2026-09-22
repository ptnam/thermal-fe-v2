<template>
  <PdWidgetCard v-loading="loading">
    <template #title>Số lượng cảnh báo theo khu vực</template>
    <VueApexChart type="bar" height="380" :options="chartOptions" :series="series" />
  </PdWidgetCard>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { notificationCountByAreaApi } from '@/api/notification'
import PdWidgetCard from './PdWidgetCard.vue'
import { useChartTheme } from './useChartTheme'
import VueApexChart from 'vue3-apexcharts'

// Widget "So sánh theo khu vực" (tab Thống kê Phóng điện vượt ngưỡng) - khác widget "Số lượng cảnh báo theo
// ngày" ở chỗ nhóm theo NƠI thay vì theo NGÀY - biết khu vực nào đang phát sinh nhiều cảnh báo PD nhất.
// Khu vực/khoảng thời gian dùng chung bộ lọc của cả tab (pd-summary.vue), không còn filter riêng.
const PD_WARNING_EVENT_CODE = 'PD_EXCEEDED'

const props = defineProps<{
  areaId: number | null
  startDate: string
  endDate: string
}>()

interface AreaCountItem {
  areaName?: string
  count: number
}

const items = ref<AreaCountItem[]>([])
const { axisTextColor, gridColor, tooltipTheme } = useChartTheme()

// chartOptions phải là computed để categories cập nhật theo items (và đổi màu chữ/lưới theo dark/light) -
// object tĩnh + updateOptions bị bỏ lỡ khi refresh() chạy trước lúc chart khởi tạo xong.
const series = computed(() => [{ name: 'Số lượng cảnh báo', data: items.value.map((i) => i.count) }])
const chartOptions = computed(() => ({
  chart: { height: 380, type: 'bar' as const, toolbar: { show: true } },
  colors: ['#2563eb'],
  dataLabels: { enabled: true },
  plotOptions: { bar: { columnWidth: '45%', borderRadius: 4, horizontal: false } },
  grid: { borderColor: gridColor.value },
  xaxis: {
    categories: items.value.map((i) => i.areaName ?? '—'),
    title: { text: 'Khu vực', style: { color: axisTextColor.value, fontSize: '12px' } },
    labels: { style: { colors: axisTextColor.value } },
  },
  yaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    allowDecimals: false,
    labels: { style: { colors: axisTextColor.value } },
    title: { text: 'Số lượng cảnh báo', style: { color: axisTextColor.value, fontSize: '12px' } },
  },
  tooltip: { theme: tooltipTheme.value },
  noData: { text: 'Không có dữ liệu', style: { color: axisTextColor.value } },
}))

const loading = ref(false)

const refresh = async () => {
  loading.value = true
  try {
    const res = await notificationCountByAreaApi({
      startDate: props.startDate,
      endDate: props.endDate,
      warningEventCode: PD_WARNING_EVENT_CODE,
      areaId: props.areaId ?? undefined,
    })
    items.value = (res.data as AreaCountItem[]) ?? []
  } finally {
    loading.value = false
  }
}

watch(() => [props.areaId, props.startDate, props.endDate], refresh, { immediate: true })
</script>
