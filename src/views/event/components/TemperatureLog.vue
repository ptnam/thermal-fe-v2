<template>
  <div v-loading="isLoading || getSettingLoading">
    <div class="card" style="padding: 20px;">
      <div class="summary-header">
        <div class="summary-title">Nhật ký nhiệt độ theo điểm đo</div>
        <div class="header-tools">
          <div class="avg-dropdown">
            <div class="filter-badge-simple" id="avgSelectBtn" onclick="toggleAvgMenu(event)">
              <span class="avg-tag">AVG</span>
              <span class="avg-text" style="font-size: 15px; font-weight: 700; color: white;">Trung
                                    bình</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" style="margin-left: 15px">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>

            <div class="avg-menu" id="avgMenu">
              <div class="avg-item" onclick="selectAvg('MAX')">
                <div class="avg-icon-box box-max">MAX</div>
                <div class="avg-info">
                  <h4>Nhiệt độ Max</h4>
                  <p>Giá trị cao nhất trong khoảng thời gian</p>
                </div>
                <div class="avg-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6"
                       stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <div class="avg-item" onclick="selectAvg('MIN')">
                <div class="avg-icon-box box-min">MIN</div>
                <div class="avg-info">
                  <h4>Nhiệt độ Min</h4>
                  <p>Giá trị thấp nhất trong khoảng thời gian</p>
                </div>
                <div class="avg-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6"
                       stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <div class="avg-item active" onclick="selectAvg('AVG')">
                <div class="avg-icon-box box-avg">AVG</div>
                <div class="avg-info">
                  <h4>Trung bình</h4>
                  <p>Giá trị trung bình trong khoảng thời gian</p>
                </div>
                <div class="avg-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6"
                       stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="filter-badge-simple" onclick="openFilterDrawer()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span class="avg-text">Bộ lọc</span> <span class="badge-count">4</span>
          </div>
        </div>
      </div>
      <div class="chart-box">
        <div id="temperatureChart"></div>
      </div>
    </div>
    <el-form
        :inline="true"
    >
      <el-row>
        <el-form-item label="Khu vực">
          <tree-select-remote
              v-model="searchParams.areaId"
              :request-fn="getAllTreeAreaApi"
              filterable
              clearable
              @change="changeAreaId"
          />
        </el-form-item>
        <el-form-item v-if="searchParams.areaId" label="Thiết bị">
          <virtualized-select-from-url
              ref="machineRef"
              v-model="searchParams.machineIds"
              :request-fn="() => getAllMachineApi({areaId:searchParams.areaId})"
              filterable
              value-key="id"
              col-label="name"
              :default-first-option="true"
              clearable
              multiple
              @change="changeMachine"
          />
        </el-form-item>
        <el-form-item v-if="searchParams.machineIds" label="Bộ phận">
          <virtualized-select-from-url
              ref="machineComponentRef"
              v-model="searchParams.machineComponentIds"
              :request-fn="() => getMultiComponentsMachineApi({machineIds:searchParams.machineIds})"
              filterable
              value-key="id"
              :default-first-option="true"
              clearable
              multiple
              @change="changeMachineComponent"
          />
        </el-form-item>
        <el-form-item v-show="searchParams.machineComponentIds">
          <el-tooltip
              content="Thiết lập thiết bị mặc định"
          >
            <el-button
                :loading="saveSettingLoading"
                :icon="Setting"
                @click="()=> saveSetting(searchParams)"
            ></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item v-if="searchParams.machineComponentIds && searchParams.machineComponentIds.length === 1"
                      label="Điểm giám sát">
          <ObjectSelectFromUrl
              ref="monitorPointIdRef"
              v-model="monitorPoint"
              :request-fn="() => allMonitorPointsByMachineComponentApi({machineComponentId: searchParams.machineComponentIds[0]})"
              filterable
              value-key="id"
              clearable
              @change="changeMonitorPoint"
          />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item>
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
        <el-form-item>
          <search-button @click="search"></search-button>
        </el-form-item>
      </el-row>
    </el-form>
    <div>
      <VueApexChart
          type="line"
          ref="chartRef"
          height="580"
          :options="chartOptions"
          :series="series">
      </VueApexChart>
    </div>
  </div>
</template>
<script setup lang="ts">
import VirtualizedSelectFromUrl from "@/components/Selection/VirtualizedSelectFromUrl.vue";
import {
  getAllMachineApi, getMachineSettingApi,
  getMultiComponentsMachineApi, saveMachineSettingApi
} from '@/api/machine'
import useRequest from "@/hooks/web/useRequest";
import {computed, nextTick, onMounted, ref} from 'vue'
import VueApexChart from "vue3-apexcharts";
import {getAllTreeAreaApi} from "@/api/area";
import SearchButton from "@/components/Button/SearchButton.vue";
import {
  componentThermalDataApi,
  dailyThermalDataApi,
  hourlyThermalDataApi, predictThermalDataApi, timeThermalDataApi,
} from "@/api/thermal-data";
import TreeSelectRemote from "@/components/Tree/TreeSelectRemote.vue";
import ObjectSelectFromUrl from "@/components/Selection/ObjectSelectFromUrl.vue";
import {Setting} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import dayjs from 'dayjs'
import {allMonitorPointsByMachineComponentApi} from "@/api/monitor-point";
import { ApexOptions } from "apexcharts";

const HOUR = 1
const DAY = 2
const TIME = 3
const PHASE = 4
const PREDICT = 5

const chartOptions: ApexOptions = {
  chart: {
    height: 450,
    type: 'area',
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] }
  },
  markers: { size: 0, hover: { size: 5 } },
  xaxis: {
    categories: [],
    labels: { style: { colors: '#94A3B8', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#94A3B8', fontSize: '12px' },
      formatter: (v) => v.toFixed(1) + "°C"
    },
    title: { text: 'Nhiệt độ (°C)', style: { color: '#94A3B8', fontWeight: 600 } }
  },
  grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
  theme: { mode: 'dark' },
  tooltip: { x: { show: true }, theme: 'dark' },
}
const series = ref(
    []
)
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

const searchParams = ref({
  areaId: null,
  machineIds: null,
  machineComponentIds: [],
  monitorPointId: null,
  monitorPointType: null,
  reportDate: new Date().toISOString().split('T')[0],
  startDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD 00:00:00'),
  endDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
})

const chartRef = ref<ApexCharts | null>(null)
const machineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const machineComponentRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const monitorPointIdRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()

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

const search = () => {
  const mapApi = {
    1: hourlyThermalDataApi,
    2: dailyThermalDataApi,
    3: timeThermalDataApi,
    4: componentThermalDataApi,
    5: predictThermalDataApi
  }
  onRequest(mapApi[searchType.value], searchParams.value).then(res => {
    chartRef.value?.updateOptions({
      xaxis: {
        categories: res.data.categories,
      }
    })
    chartRef.value?.updateSeries(res.data.chartData);
  })
}


const changeAreaId = () => {
  searchParams.value['machineIds'] = null
  searchParams.value['machineComponentIds'] = []
  searchParams.value['monitorPointId'] = null
  searchParams.value['monitorPointType'] = null
  nextTick(() => {
    machineRef?.value?.fetch()
  })
}
const changeMachine = () => {
  searchParams.value['machineComponentIds'] = []
  searchParams.value['monitorPointIds'] = null
  searchParams.value['monitorPointType'] = null
  machineComponentRef?.value?.fetch()
}

const changeMachineComponent = () => {
  searchParams.value['monitorPointIds'] = null
  searchParams.value['monitorPointType'] = null
  monitorPointIdRef?.value?.fetch()
}

const changeMonitorPoint = (pointItem: any) => {
  // searchParams.value['monitorPointId'] = pointItem.id
  searchParams.value['monitorPointType'] = pointItem.monitorPointType
}

const {onRequest: saveSettingRequest, isLoading: saveSettingLoading} = useRequest();

const saveSetting = (data: any) => {
  saveSettingRequest(saveMachineSettingApi, data).then(_res => {
    ElMessage({
      message: 'Lưu thành công!',
      type: 'success',
    })
  })
}

const {onRequest: getSettingRequest, isLoading: getSettingLoading} = useRequest();
onMounted(() => {
  getSettingRequest(getMachineSettingApi).then(res => {
    searchParams.value = {...searchParams.value, ...res.data}
  }).finally(() => {
    search()
  })
})
</script>