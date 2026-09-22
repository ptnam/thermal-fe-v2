<template>
  <PdWidgetCard v-loading="isLoading">
    <template #title>Nhật ký phóng điện theo điểm đo</template>
    <template #filters>
      <div class="filter-badge-simple" @click="dialogVisible = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>Bộ lọc</span> <span class="badge-count">{{ countValidFields(searchParams) }}</span>
      </div>
    </template>

    <VueApexChart type="area" ref="chartRef" height="480" :options="chartOptions" :series="series" />
  </PdWidgetCard>

  <drawer-form v-model="dialogVisible" :destroy-on-close="true" title="Bộ lọc dữ liệu">
    <div class="drawer">
      <div class="drawer-header">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Bộ lọc dữ liệu
        </h3>
        <button class="close-drawer" @click="dialogVisible = false">×</button>
      </div>
      <div class="drawer-body" style="padding: 10px">
        <filter-group-input-tree v-model="searchParams.areaIds" title="Khu vực" @change="changeAreaIds" />
        <filter-group-input
          v-show="searchParams.areaIds"
          ref="machineInputRef"
          :request-fn="() => getMachinesByAreasApi({ areaIds: searchParams.areaIds })"
          v-model="searchParams.machineIds"
          title="Thiết bị"
          col-label="name"
          col-value="id"
          @change="changeMachineIds"
        />
        <!-- hasMonitorPoints=false - bộ phận PD khớp qua vùng vẽ trên camera BATCAM, không qua MachineMonitorPoints -->
        <filter-group-input
          v-show="searchParams.machineIds"
          ref="machineComponentInputRef"
          :request-fn="() => getMultiComponentsMachineApi({ machineIds: searchParams.machineIds, hasMonitorPoints: false })"
          v-model="searchParams.machineComponentIds"
          title="Bộ phận"
          col-label="name"
          col-value="id"
        />
        <filter-group title="KHOẢNG THỜI GIAN" :default-open="true">
          <div class="px-4">
            <el-form-item>
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                start-placeholder="Bắt đầu"
                end-placeholder="Kết thúc"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-full"
              />
            </el-form-item>
          </div>
        </filter-group>
        <filter-group title="KIỂU TỔNG HỢP" :default-open="true">
          <div class="px-4">
            <el-form-item>
              <el-select v-model="aggregation" class="!w-full">
                <el-option v-for="item in aggregationOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
        </filter-group>
      </div>
      <div class="drawer-footer">
        <el-button class="btn-reset-drawer" @click="onReset">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Đặt lại</span>
        </el-button>
        <button class="btn-apply-drawer" @click="onApply">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Áp dụng</span>
        </button>
      </div>
    </div>
  </drawer-form>
</template>

<script setup lang="ts">
import PdWidgetCard from './PdWidgetCard.vue'
import FilterGroupInput from '@/views/event/components/FilterGroupInput.vue'
import FilterGroupInputTree from '@/views/event/components/FilterGroupInputTree.vue'
import FilterGroup from '@/views/event/components/FilterGroup.vue'
import DrawerForm from '@/components/Form/DrawerForm.vue'
import { getMachinesByAreasApi, getMultiComponentsMachineApi } from '@/api/machine'
import { pdChartByTimeApi } from '@/api/pd-data'
import useRequest from '@/hooks/web/useRequest'
import { useChartTheme } from './useChartTheme'
import { computed, ref } from 'vue'
import VueApexChart from 'vue3-apexcharts'
import dayjs from 'dayjs'

const aggregationOptions = [
  { value: 'avg', label: 'Trung bình' },
  { value: 'min', label: 'Nhỏ nhất' },
  { value: 'max', label: 'Lớn nhất' },
]

const { axisTextColor, gridColor, legendTextColor, tooltipTheme } = useChartTheme()
const categories = ref<string[]>([])

// computed để đổi màu chữ/lưới theo dark/light - ApexCharts vẽ chữ bằng màu cứng, không tự theo CSS
// var(--text-*) như khung card.
const chartOptions = computed(() => ({
  chart: {
    height: 480,
    type: 'area',
    toolbar: { show: true },
    zoom: { enabled: true, allowMouseWheelZoom: false },
  },
  colors: ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'solid', opacity: 0.35 },
  grid: {
    borderColor: gridColor.value,
  },
  markers: { size: 0, hover: { sizeOffset: 6 } },
  xaxis: {
    categories: categories.value,
    title: { text: 'Thời gian', style: { color: axisTextColor.value, fontSize: '12px' } },
    labels: { style: { colors: axisTextColor.value } },
  },
  yaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      show: true,
      hideOverlappingLabels: true,
      style: { colors: axisTextColor.value },
      formatter: (val: number) => `${val} dB`,
    },
    title: { text: 'Cường độ PD (dB)', style: { color: axisTextColor.value, fontSize: '12px' } },
  },
  legend: { position: 'bottom', labels: { colors: legendTextColor.value } },
  tooltip: { theme: tooltipTheme.value },
  noData: { text: 'Không có dữ liệu', style: { color: axisTextColor.value } },
}))
const series = ref<{ name: string; data: (number | null)[] }[]>([])

const DEFAULT_START = dayjs().subtract(2, 'day').format('YYYY-MM-DD 00:00:00')
const DEFAULT_END = dayjs().format('YYYY-MM-DD HH:mm:ss')

const searchParams = ref({
  areaIds: [] as number[],
  machineIds: [] as number[],
  machineComponentIds: [] as number[],
  startDate: DEFAULT_START,
  endDate: DEFAULT_END,
})
const aggregation = ref('avg')
const dialogVisible = ref(false)

const dateRange = computed<[string, string] | []>({
  get() {
    return searchParams.value.startDate && searchParams.value.endDate
      ? [searchParams.value.startDate, searchParams.value.endDate]
      : []
  },
  set([start, end]) {
    searchParams.value.startDate = start ?? ''
    searchParams.value.endDate = end ?? ''
  },
})

function countValidFields(obj: any) {
  return Object.values(obj).filter((v) => {
    if (v === null || v === undefined) return false
    if (typeof v === 'string' && v.trim() === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  }).length
}

const chartRef = ref<ApexCharts | null>(null)
const machineInputRef = ref<any>(null)
const machineComponentInputRef = ref<any>(null)

function changeAreaIds() {
  searchParams.value.machineIds = []
  searchParams.value.machineComponentIds = []
  machineInputRef.value?.fetch()
}
function changeMachineIds() {
  searchParams.value.machineComponentIds = []
  machineComponentInputRef.value?.fetch()
}

const { onRequest, isLoading } = useRequest()

function search() {
  if (!searchParams.value.machineComponentIds.length) {
    series.value = []
    return
  }
  onRequest(pdChartByTimeApi, {
    machineComponentIds: searchParams.value.machineComponentIds,
    startDate: searchParams.value.startDate,
    endDate: searchParams.value.endDate,
    aggregation: aggregation.value,
  }).then((res: any) => {
    categories.value = res.data.categories
    chartRef.value?.updateSeries((res.data.chartData ?? []).map((s: any) => ({ name: s.name, data: s.data })))
  })
}

function onApply() {
  dialogVisible.value = false
  search()
}

function onReset() {
  searchParams.value = {
    areaIds: [],
    machineIds: [],
    machineComponentIds: [],
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
  }
  aggregation.value = 'avg'
  series.value = []
  categories.value = []
}
</script>

<style scoped>
.filter-badge-simple {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
  cursor: pointer;
  height: 34px;
  font-weight: 600;
}
.badge-count {
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-main);
  font-weight: 700;
}
.close-drawer {
  background: transparent;
  border: none;
  color: var(--text-sub);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}
.close-drawer:hover {
  color: var(--text-main);
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
}
.drawer-footer {
  padding: 24px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 12px;
}
.btn-reset-drawer {
  flex: 1;
  height: 47px;
  background: var(--bg-body);
  color: var(--text-main);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-apply-drawer {
  flex: 1.5;
  height: 47px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-apply-drawer:hover {
  filter: brightness(0.9);
}
</style>
