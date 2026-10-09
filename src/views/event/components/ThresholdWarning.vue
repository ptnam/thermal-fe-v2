<template>
  <div class="card" style="padding: 20px;">
    <div class="summary-header">
      <div class="summary-title">{{ t('alert.home.tabAlertStats') }}</div>
    </div>

    <div class="filter-section-modern">
      <div class="filter-row-inline">
        <div class="filter-group-inline">
          <label>{{ t('fields.area') }}</label>
          <tree-select-remote
              v-model="searchParams.areaId"
              :request-fn="getAllTreeAreaApi"
              filterable
              clearable
          />
        </div>
        <div class="filter-group-inline">
          <label>{{ t('alert.fromDate') }}</label>
          <el-date-picker
              v-model="searchParams.startDate"
              type="date"
              :placeholder="t('alert.startDate')"
              value-format="YYYY-MM-DD"
              class="select-single-modern !w-full"
          />
        </div>
        <div class="filter-group-inline">
          <label>{{ t('alert.toDate') }}</label>
          <el-date-picker
              v-model="searchParams.endDate"
              type="date"
              :placeholder="t('alert.endDate')"
              value-format="YYYY-MM-DD"
              class="select-single-modern !w-full"
          />
        </div>
        <button class="btn-search-primary" @click="refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {{ t('common.search') }}
        </button>
        <el-button :loading="isLoadingExport" class="btn-export" @click="exportFile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </el-button>
      </div>
    </div>

    <div class="chart-box" v-loading="loading">
      <VueApexChart
          ref="chartBarRef"
          type="bar"
          height="500"
          :options="chartOptions"
          :series="series">
      </VueApexChart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import { onMounted, ref} from "vue";
import {exportCountApi, notificationsCountApi} from "@/api/notification";
import VueApexChart from "vue3-apexcharts";
import {ApexOptions} from "apexcharts";
import {getAllTreeAreaApi} from "@/api/area";
import TreeSelectRemote from "@/components/Tree/TreeSelectRemote.vue";
import useRequest from "@/hooks/web/useRequest";
import {downloadFile} from "@/utils/response";

const { t } = useLang()

const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'bar',
    height: 450,
    background: 'transparent',
    toolbar: {show: false}
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '45%',
      distributed: true,
      dataLabels: {position: 'top'}
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val;
    },
    offsetY: -20,
    style: {fontSize: '12px', colors: ["#94A3B8"]}
  },
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E', '#14B8A6', '#F97316', '#6366F1', '#D946EF'],
  legend: {show: false},

  stroke: {
    curve: 'straight'
  },
  xaxis: {
    categories: [],
    labels: {style: {colors: '#94A3B8', fontSize: '12px'}},
    axisBorder: {show: false},
    axisTicks: {show: false}
  },
  yaxis: {
    labels: {style: {colors: '#94A3B8'}},
    title: {text: t('alert.stats.countAxis'), style: {color: '#94A3B8', fontWeight: 600}}
  },
  grid: {borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4},
  tooltip: {theme: 'dark'}
})

const series = ref<any[]>([{
  name: t('alert.stats.alertCount'),
  data: []
}])
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // format to YYYY-MM-DD
}

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 6);

// Chỉ thống kê cảnh báo nhiệt độ - listNotificationApi/notificationsCountApi trả cả PD nếu không lọc.
const THERMAL_WARNING_EVENT_CODE = 'OVERTHERMAL'
const searchParams = ref({
  areaId: null,
  startDate: formatDate(sevenDaysAgo),
  endDate: formatDate(today),
  warningEventCode: THERMAL_WARNING_EVENT_CODE,
})

const loading = ref(false)

const chartBarRef = ref<ApexCharts>()

// const dateRange = computed<[string, string] | []>({
//   get() {
//     return searchParams.value.startDate && searchParams.value.endDate
//         ? [searchParams.value.startDate, searchParams.value.endDate]
//         : []
//   },
//   set([start, end]) {
//     searchParams.value = {
//       ...searchParams.value,
//       startDate: start ?? '',
//       endDate: end ?? ''
//     }
//     nextTick(() => {
//       refresh()
//     })
//   }
// })
const refresh = () => {
  loading.value = true
  notificationsCountApi(searchParams.value).then(res => {
    let seriesData: number[] = [];
    let categoryLabel: string[] = [];

    for (const item of res.data as { numberOfNotifications: number; dataDate: string }[]) {
      seriesData.push(item.numberOfNotifications);
      categoryLabel.push(item.dataDate);
    }
    series.value = [{
      name: t('alert.stats.alertCount'),
      data: seriesData
    }]
    chartBarRef.value?.updateSeries(series.value, true)
    chartBarRef.value?.updateOptions({
      xaxis: {
        categories: categoryLabel,
      }
    }, true, true)
  }).finally(() => {
    loading.value = false
  })
}
const {onRequest: requestExport, isLoading: isLoadingExport} = useRequest()
const exportFile = () => {
  requestExport(exportCountApi, searchParams.value).then((res) => {
    downloadFile(res)
  })
}

onMounted(() => {
  refresh()
})
</script>
<style scoped>
/* NEW HORIZONTAL FILTER STYLE */
.filter-section-modern {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row-inline {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-group-inline {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  flex: 1;
}

.filter-group-inline label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.select-single-modern {
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  min-height: 38px;
}

/* Multi-select box looking like an input */
.multi-select-box {
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
  min-width: 150px;
}

.multi-select-box:hover {
  border-color: var(--primary);
}

.tags-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: hidden;
  position: relative;
  flex: 1;
  /* Optional: Add a fade effect to the right */
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}

.select-single-modern,
.date-range-box input {
  width: 100% !important;
}

.select-single-modern {
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  min-height: 38px;
}

.date-range-box {
  display: flex;
  align-items: center;
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
  height: 38px;
  gap: 10px;
}

.date-range-box svg {
  color: var(--primary);
  flex-shrink: 0;
}

.date-range-box input {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 14px;
  width: 165px;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
}

/* Style datetime-local calendar icon */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1) brightness(0.9);
  cursor: pointer;
}

.btn-search-primary {
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 24px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.btn-search-primary:hover {
  background: #2563EB;
  transform: translateY(-1px);
}

.btn-icon-square {
  width: 38px;
  height: 38px;
  border: 1px solid var(--border);
  background: var(--bg-body);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  cursor: pointer;
  transition: 0.2s;
}

.btn-icon-square:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.btn-export {
  background: var(--success);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.btn-export:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.export-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  z-index: 1001;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  margin-top: 8px;
  animation: fadeIn 0.2s ease;
}

.export-dropdown.open .export-menu {
  display: block;
}
</style>