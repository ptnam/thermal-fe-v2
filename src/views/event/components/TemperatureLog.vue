<template>
  <div v-loading="isLoading || getSettingLoading">
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
              v-model="searchParams.machineId"
              :request-fn="() => getAllMachineApi({areaId:searchParams.areaId})"
              filterable
              value-key="id"
              col-label="name"
              :default-first-option="true"
              clearable
              @change="changeMachine"
              style="width: 180px"
          />
        </el-form-item>
        <el-form-item v-if="searchParams.machineId" label="Bộ phận">
          <virtualized-select-from-url
              ref="machineComponentRef"
              v-model="searchParams.machineComponentId"
              :request-fn="() => getComponentMachineApi({machineId:searchParams.machineId})"
              filterable
              value-key="id"
              :default-first-option="true"
              clearable
              style="width: 150px"
              @change="changeMachineComponent"
          />
        </el-form-item>
        <el-form-item v-show="searchParams.machineComponentId">
          <el-tooltip
            content="Thiết lập thiết bị mặc định"
          >
          <el-button :loading="saveSettingLoading" :icon="Setting" @click="()=> saveSetting(searchParams)"></el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item v-if="searchParams.machineComponentId" label="Điểm giám sát">
          <ObjectSelectFromUrl
              ref="monitorPointIdRef"
              v-model="monitorPoint"
              :request-fn="() => allMonitorPointsByMachineComponentApi(searchParams.machineComponentId)"
              filterable
              value-key="id"
              clearable
              style="width: 150px"
              @change="changeMonitorPoint"
          />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item>
          <el-select
              style="width: 160px"
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
import { getAllMachineApi, getComponentMachineApi, getMachineSettingApi, saveMachineSettingApi } from '@/api/machine'
import useRequest from "@/hooks/web/useRequest";
import { computed, nextTick, onMounted, ref } from 'vue'
import {allMonitorPointsByMachineComponentApi} from "@/api/monitor-point";
import VueApexChart from "vue3-apexcharts";
import {getAllTreeAreaApi} from "@/api/area";
import SearchButton from "@/components/Button/SearchButton.vue";
import {
  componentThermalDataApi,
  dailyThermalDataApi,
  hourlyThermalDataApi, timeThermalDataApi,
} from "@/api/thermal-data";
import TreeSelectRemote from "@/components/Tree/TreeSelectRemote.vue";
import ObjectSelectFromUrl from "@/components/Selection/ObjectSelectFromUrl.vue";
import { Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const HOUR = 1
const DAY = 2
const TIME = 3
const PHASE = 4

const chartOptions = {
  chart: {
    height: 350,
    type: 'line',
    dropShadow: {
      enabled: true,
      color: '#000',
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.2
    },
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth'
  },
  title: {
    align: 'left'
  },
  grid: {
    borderColor: '#e7e7e7',
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    },
  },
  markers: {
    size: 0,
    hover: {
      sizeOffset: 6
    }
  },
  xaxis: {
    categories: [],
    title: {},
    stepSize: 3
  },
  yaxis: {
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: true,
      hideOverlappingLabels: true,
      formatter: function (val) {
        return val + "°C";
      }
    },
    title: {},
  },
}
const series = ref(
    []
)
const searchType = ref(PHASE)
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
    value: PHASE,
    label: "So sách các pha"
  }
];

const monitorPoint = ref();

const searchParams = ref({
  areaId: null,
  machineId: null,
  machineComponentId: null,
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
    4: componentThermalDataApi
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
  searchParams.value['machineId'] = null
  searchParams.value['machineComponentId'] = null
  searchParams.value['monitorPointId'] = null
  searchParams.value['monitorPointType'] = null
  nextTick(() => {
    machineRef?.value?.fetch()
  })
}
const changeMachine = () => {
  searchParams.value['machineComponentId'] = null
  searchParams.value['monitorPointId'] = null
  searchParams.value['monitorPointType'] = null
  machineComponentRef?.value?.fetch()
}

const changeMachineComponent = () => {
  searchParams.value['monitorPointId'] = null
  searchParams.value['monitorPointType'] = null
  monitorPointIdRef?.value?.fetch()
}

const changeMonitorPoint = (pointItem: any) => {
  searchParams.value['monitorPointId'] = pointItem.id
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