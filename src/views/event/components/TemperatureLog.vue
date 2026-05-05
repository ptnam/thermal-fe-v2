<template>
  <div v-loading="isLoading || getSettingLoading">
    <div class="card" style="padding: 20px;">
      <div class="summary-header">
        <div class="summary-title">Nhật ký nhiệt độ theo điểm đo</div>
        <div class="header-tools">
          <AvgSelect v-model="avgType" @change="()=>search()"/>
          <div class="filter-badge-simple" @click="()=>dialogVisible = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span class="avg-text">Bộ lọc</span> <span class="badge-count">{{ countValidFields(searchParams) }}</span>
          </div>
          <drawer-form
              v-model="dialogVisible"
              :destroy-on-close="true"
              title="Bộ lọc dữ liệu"
              style="min-width: 300px">
            <div class="drawer">
              <div class="drawer-header">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Bộ lọc dữ liệu
                </h3>
                <button class="close-drawer" @click="()=>dialogVisible = false">×</button>
              </div>
              <div class="drawer-body" style="padding: 10px">
                <filter-group-input-tree
                    v-model="searchParams.areaIds"
                    title="Khu vực"
                    @change="changeAreaIds"
                />
                <filter-group-input
                    v-show="searchParams.areaIds"
                    ref="machineInputRef"
                    :request-fn="() => getMachinesByAreasApi({areaIds:searchParams.areaIds})"
                    v-model="searchParams.machineIds"
                    title="Thiết bị"
                    col-label="name"
                    col-value="id"
                    @change="changeMachineIds"
                />
                <filter-group-input
                    v-show="searchParams.machineIds"
                    ref="machineComponentInputRef"
                    :request-fn="() => getMultiComponentsMachineApi({machineIds:searchParams.machineIds})"
                    v-model="searchParams.machineComponentIds"
                    title="Bộ phận"
                    col-label="name"
                    col-value="id"
                />
                <filter-group-input
                    v-show="searchParams.machineComponentIds && searchParams.machineComponentIds.length === 1"
                    :request-fn="() => allMonitorPointsByMachineComponentApi({machineComponentIds: searchParams.machineComponentIds})"
                    v-model="monitorPoint"
                    title="Điểm giám sát"
                    col-label="name"
                    col-value="id"
                />
                <filter-group title="KHOẢNG THỜI GIAN">
                  <el-form-item label="">
                    <el-select
                        v-model="searchType"
                        filterable
                        value-key="id"
                        :default-first-option="true"
                        clearable
                    >
                      <el-option
                          v-for="item in searchTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="searchType === HOUR">
                    <el-date-picker
                        v-model="searchParams.reportDate"
                        type="date"
                        placeholder="Pick a day"
                        value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item v-if="searchType === DAY">
                    <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        start-placeholder="Ngày bắt đầu"
                        end-placeholder="Ngày kết thúc"
                        value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item v-if="searchType === TIME || searchType === PHASE">
                    <el-date-picker
                        v-model="dateRange"
                        type="datetimerange"
                        start-placeholder="Ngày bắt đầu"
                        end-placeholder="Ngày kết thúc"
                        value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </el-form-item>
                </filter-group>
              </div>
              <div class="drawer-footer" style="gap: 10px;">
                <el-button class="btn-reset-drawer"
                           @click="()=> {
                          loadSetting()
                        }" style="flex: 1;" v-show="searchParams.machineComponentIds">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M23 4v6h-6"></path>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  <span class="px-2 whitespace-nowrap">Đặt lại</span>
                </el-button>
                <el-button
                    :loading="saveSettingLoading"
                    @click="()=> saveSetting(searchParams)"
                    class="btn-save-drawer"
                    style="flex: 1.2; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); color: var(--primary); padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; justify-content: center; transition: 0.2s;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span class="px-2 whitespace-nowrap">Lưu</span>
                </el-button>
                <button class="btn-apply-drawer whitespace-nowrap" @click="() => {
                  search();
                  dialogVisible = false
                }" style="flex: 1.5;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span class="whitespace-nowrap">Áp dụng</span>
                </button>
              </div>
            </div>
          </drawer-form>
        </div>
      </div>
      <div class="chart-box">
        <VueApexChart
            type="area"
            ref="chartRef"
            height="580"
            :options="chartOptions"
            :series="series">
        </VueApexChart>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  getMachineSettingApi,
  getMultiComponentsMachineApi, saveMachineSettingApi, getMachinesByAreasApi
} from '@/api/machine'
import useRequest from "@/hooks/web/useRequest";
import {computed, onMounted, ref} from 'vue'
import VueApexChart from "vue3-apexcharts";
import {
  componentThermalDataApi,
  dailyThermalDataApi,
  hourlyThermalDataApi, predictThermalDataApi, timeThermalDataApi,
} from "@/api/thermal-data";
import {Setting} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import dayjs from 'dayjs'
import {allMonitorPointsByMachineComponentApi} from "@/api/monitor-point";
import {ApexOptions} from "apexcharts";
import AvgSelect from "@/views/event/components/AvgSelect.vue";
import DrawerForm from "@/components/Form/DrawerForm.vue";
import FilterGroupInput from '@/views/event/components/FilterGroupInput.vue'
import FilterGroupInputTree from '@/views/event/components/FilterGroupInputTree.vue'
import FilterGroup from '@/views/event/components/FilterGroup.vue'

const HOUR = 1
const DAY = 2
const TIME = 3
const PHASE = 4
const PREDICT = 5

const chartOptions: ApexOptions = {
  chart: {
    height: 450,
    type: 'area',
    toolbar: {show: false},
    animations: {enabled: true, speed: 800}
  },
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  stroke: {curve: 'smooth', width: 3},
  markers: {size: 0, hover: {size: 5}},
  xaxis: {
    categories: [],
    labels: {style: {colors: '#94A3B8', fontSize: '12px'}},
    axisBorder: {show: false},
    axisTicks: {show: false}
  },
  yaxis: {
    labels: {
      style: {colors: '#94A3B8', fontSize: '12px'},
      formatter: (v) => v.toFixed(1) + "°C"
    },
    title: {text: 'Nhiệt độ (°C)', style: {color: '#94A3B8', fontWeight: 600}}
  },
  grid: {borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4},
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    offsetY: 8,
    labels: {colors: '#94A3B8'},
  },
  tooltip: {x: {show: true}, theme: 'dark'},
}
const series = ref(
    []
)
const avgType = ref<'1' | '2' | '3'>('3')
const searchType = ref(TIME)
const searchTypeOptions = [
  {
    value: HOUR,
    label: "Giờ"
  },
  {
    value: DAY,
    label: "Ngày"
  },
  {
    value: TIME,
    label: "Khoảng thời gian"
  },
  {
    value: PREDICT,
    label: "Dự đoán xu hướng nhiệt"
  },
  // {
  //   value: PHASE,
  //   label: "So sách các pha"
  // }
];

const monitorPoint = ref();
const dialogVisible = ref(false)
const searchParams = ref({
  areaIds: [],
  machineIds: [],
  machineComponentIds: [],
  monitorPointId: null,
  monitorPointType: null,
  reportDate: new Date().toISOString().split('T')[0],
  startDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD 00:00:00'),
  endDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
})

const chartRef = ref<ApexCharts | null>(null)
// const machineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
// const machineComponentRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
// const monitorPointIdRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()

const dateRange = computed<[string, string] | []>({
  get() {
    return searchParams.value.startDate && searchParams.value.endDate
        ? [searchParams.value.startDate, searchParams.value.endDate]
        : []
  },
  set([start, end]) {
    searchParams.value = {
      ...searchParams.value,
      startDate: start ?? '',
      endDate: end ?? ''
    }
  }
})
const {onRequest, isLoading} = useRequest();
const countValidFields = (obj: any) => {
  return Object.values(obj).filter(v => {
    if (v === null || v === undefined) return false
    if (typeof v === 'string' && v.trim() === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  }).length
}

const machineComponentInputRef = ref(null);
const machineInputRef = ref(null);
const changeMachineIds = () => {
  machineComponentInputRef?.value?.fetch();
  searchParams.value = {
    ...searchParams.value,
    machineComponentIds: []
  }
};
const changeAreaIds = () => {
  machineInputRef?.value?.fetch()
  searchParams.value = {
    ...searchParams.value,
    machineIds: []
  }
};
const search = () => {
  const mapApi = {
    1: hourlyThermalDataApi,
    2: dailyThermalDataApi,
    3: timeThermalDataApi,
    4: componentThermalDataApi,
    5: predictThermalDataApi
  }
  onRequest(mapApi[searchType.value], {...searchParams.value, dataMode: avgType.value}).then(res => {
    chartRef.value?.updateOptions({
      xaxis: {
        categories: res.data.categories,
      }
    })
    chartRef.value?.updateSeries(res.data.chartData);
  })
}

//
// const changeAreaId = () => {
//   searchParams.value['machineIds'] = null
//   searchParams.value['machineComponentIds'] = []
//   searchParams.value['monitorPointId'] = null
//   searchParams.value['monitorPointType'] = null
//   nextTick(() => {
//     machineRef?.value?.fetch()
//   })
// }
// const changeMachine = () => {
//   searchParams.value['machineComponentIds'] = []
//   searchParams.value['monitorPointIds'] = null
//   searchParams.value['monitorPointType'] = null
//   machineComponentRef?.value?.fetch()
// }

// const changeMachineComponent = () => {
//   searchParams.value['monitorPointIds'] = null
//   searchParams.value['monitorPointType'] = null
//   monitorPointIdRef?.value?.fetch()
// }
//
// const changeMonitorPoint = (pointItem: any) => {
//   // searchParams.value['monitorPointId'] = pointItem.id
//   searchParams.value['monitorPointType'] = pointItem.monitorPointType
// }

const {onRequest: saveSettingRequest, isLoading: saveSettingLoading} = useRequest();

const saveSetting = (data: any) => {
  saveSettingRequest(saveMachineSettingApi, data).then(_res => {
    search()
    dialogVisible.value = false
    ElMessage({
      message: 'Lưu thành công!',
      type: 'success',
    })
  })
}

const {onRequest: getSettingRequest, isLoading: getSettingLoading} = useRequest();

const loadSetting = () => {
  getSettingRequest(getMachineSettingApi).then(res => {
    searchParams.value = {...searchParams.value, ...res.data}
  }).finally(() => {
    search()
  })
}
onMounted(() => {
  loadSetting()
})
</script>
<style scoped>
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.chart-box {
  padding: 24px;
  min-height: 480px;
  background: rgba(255, 255, 255, 0.01);
  border-radius: 12px;
  margin-top: 10px;
}

/* AVG and Filter styles */
.header-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avg-dropdown {
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  gap: 8px;
  height: 34px;
}

.avg-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 4px;
  border-radius: 4px;
}

.avg-select {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  padding-right: 4px;
}

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
  background: #3B82F6;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

/* AVG Menu Styles */
.avg-dropdown {
  position: relative;
}

.avg-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 1000;
  overflow: hidden;
}

.avg-menu.show {
  display: block;
}

.avg-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}

.avg-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.avg-item.active {
  background: rgba(59, 130, 246, 0.1);
}

.avg-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.box-max {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.box-min {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.box-avg {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.avg-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.avg-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.4;
}

.avg-check {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
}

.avg-item.active .avg-check {
  display: block;
}

/* Filter Drawer Styles - Final Refined Port */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  display: none;
  justify-content: flex-end;
  z-index: 2200;
  backdrop-filter: blur(2px);
}

.drawer-overlay.open {
  display: flex;
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
  color: #ffffff;
  font-weight: 700;
}

.close-drawer {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  transition: 0.2s;
}

.close-drawer:hover {
  color: #ffffff;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

/* Custom Scrollbar */
.drawer-body::-webkit-scrollbar,
.scroll-list::-webkit-scrollbar {
  width: 4px;
}

.drawer-footer {
  padding: 24px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 12px;
  background: var(--bg-card);
}

.btn-save-drawer {
  height: 47px;
}

.btn-reset-drawer {
  flex: 1;
  background: #94A3B8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
  height: 47px;
}

.btn-reset-drawer:hover {
  background: #64748b;
}

.btn-apply-drawer {
  flex: 1.5;
  background: #60a5fa;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
  height: 47px;
}

.btn-apply-drawer:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}
.btn-reset-drawer {
  flex: 1;
  background: #94A3B8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-reset-drawer:hover {
  background: #64748b;
}

.btn-apply-drawer {
  /* flex: 1.5; */
  background: #60a5fa;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  /* display: flex; */
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-apply-drawer:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}
</style>