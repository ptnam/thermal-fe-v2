<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {nextTick, onMounted, onUnmounted, ref} from 'vue'
import {getAllTreeAreaApi} from '@/api/area'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import SearchButton from '@/components/Button/SearchButton.vue'
import ExportButton from '@/components/Button/ExportButton.vue'
import {listPdDataApi, pdDataExportApi} from '@/api/pd-data'
import {getAllMachineApi, getComponentMachineApi} from '@/api/machine'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import dayjs from 'dayjs'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import InputNumber from '@/components/Input/InputNumber.vue'
import useRequest from '@/hooks/web/useRequest'
import {STATUS_COLOR_MAP} from '@/constants'
import {ElMessage} from 'element-plus'
import {createSignalRConnection, invokeSignalR, onSignalREvent, startSignalR, stopSignalR} from '@/plugins/signalr'
import {downloadByPathApi} from '@/api/common'
import {downloadFile} from '@/utils/response'

// Kiểu so sánh (7/8) THỰC SỰ đã dùng - xem pd-notification-system.vue / PdDataRepository.ClassifyPdReadingAsync.
const PD_LEVEL_DB_ID = 8
function pdCriteriaLabel(row: any) {
  return row.evaluationThresholdType === PD_LEVEL_DB_ID ? 'So với ngưỡng cường độ PD' : 'So với tốc độ tăng ΔPD% theo kỳ'
}
function pdUnit(row: any) {
  return row.evaluationThresholdType === PD_LEVEL_DB_ID ? 'dB' : '%'
}

const columns = ref([
  {prop: 'dateData', label: 'Ngày', width: 130, align: 'center'},
  {prop: 'timeData', label: 'Giờ', width: 110, align: 'center'},
  {prop: 'areaName', label: 'Khu vực', minWidth: 180, align: 'center'},
  {prop: 'cameraCode', label: 'Camera', width: 130, align: 'center'},
  {prop: 'zoneName', label: 'Vùng trên camera', width: 150, align: 'center'},
  {prop: 'machineName', label: 'Thiết bị', width: 130, align: 'center'},
  {prop: 'machineComponentName', label: 'Bộ phận', width: 150, align: 'center'},
  {
    label: 'Kiểu cảnh báo',
    width: 230,
    align: 'center',
    slots: {default: ({row}) => <span>{pdCriteriaLabel(row)}</span>},
  },
  {
    prop: 'appliedFormulaName',
    label: 'Công thức áp dụng',
    width: 170,
    align: 'center',
    slots: {
      default: ({row}) => row.evaluationThresholdType !== PD_LEVEL_DB_ID
        ? <span>{row.appliedFormulaName ?? 'Mặc định hệ thống'}</span>
        : <span class="muted">—</span>,
    },
  },
  {
    prop: 'levelDb',
    label: 'Cường độ PĐ',
    width: 130,
    align: 'center',
    slots: {default: ({row}) => <span>{row.levelDb} dB</span>},
  },
  {
    prop: 'referenceValue',
    label: 'Mức tham chiếu',
    width: 140,
    align: 'center',
    slots: {
      default: ({row}) => row.referenceValue != null
        ? <span>{row.referenceValue} {pdUnit(row)}</span>
        : <span class="muted">—</span>,
    },
  },
  {
    prop: 'difference',
    label: 'Chênh lệch',
    width: 130,
    align: 'center',
    slots: {
      default: ({row}) => row.difference != null
        ? <span style={{color: row.difference > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600}}>
            {row.difference > 0 ? '+' : ''}{row.difference} {pdUnit(row)}
          </span>
        : <span class="muted">—</span>,
    },
  },
  {
    prop: 'evaluationLevelObject.name',
    label: 'Đánh giá',
    width: 130,
    align: 'center',
    slots: {
      default: ({row}) => {
        const code = row?.evaluationLevelObject?.code ?? ''
        return code
          ? <span class="status-badge" style={{backgroundColor: STATUS_COLOR_MAP[code]}}>{row.evaluationLevelObject.name}</span>
          : <span class="muted">—</span>
      },
    },
  },
])

const elTableRef = ref<ComponentRef<typeof ListTemplate>>()
const machineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const machineComponentRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()

function handleAreaChange(searchParams: any) {
  searchParams.machineId = null
  searchParams.machineComponentIds = []
  nextTick(() => machineRef?.value?.fetch())
}
function handleMachineChange(searchParams: any) {
  searchParams.machineComponentIds = []
  nextTick(() => machineComponentRef?.value?.fetch())
}

onMounted(() => {
  createSignalRConnection()
  startSignalR()
  onSignalREvent('exportCompleted', function (jobId: any) {
    downloadByPathApi(`/api/Export/download/${jobId}`).then((res) => {
      downloadFile(res)
    }).finally(() => {
      isExportLoading.value = false
    })
  })
})
onUnmounted(() => {
  stopSignalR()
})

const isExportLoading = ref(false)
const {onRequest} = useRequest()
const exportFile = (searchParams: any) => {
  isExportLoading.value = true
  onRequest(pdDataExportApi, searchParams).then((res) => {
    invokeSignalR('RegisterJob', res.jobId)
    ElMessage.success('File sẽ tự động download sau khi đã xuất xong')
  })
}
</script>

<template>
  <list-template
    ref="elTableRef"
    title="Nhật ký phóng điện"
    key-list="pd-history"
    :columns="columns"
    :use-table-config="{
      fetchDataApi: listPdDataApi,
      searchDefaults: {
        fromTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD 00:00:00'),
        toTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
    }"
    :search-props="{ visibleSearchButton: false, inline: false, className:'' }"
    :show-btn-add="false"
  >
    <template slot="search" v-slot="{ searchParams }">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">Thời gian từ</div>
          <el-date-picker
            v-model="searchParams.fromTime"
            type="datetime"
            placeholder="Thời gian bắt đầu"
            format="YYYY/MM/DD hh:mm:ss A"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Thời gian đến</div>
          <el-date-picker
            v-model="searchParams.toTime"
            type="datetime"
            placeholder="Thời gian kết thúc"
            format="YYYY/MM/DD hh:mm:ss A"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Khu vực</div>
          <tree-select-remote
            v-model="searchParams.areaId"
            :requestFn="getAllTreeAreaApi"
            filterable
            clearable
            @node-click="() => handleAreaChange(searchParams)"
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Thiết bị</div>
          <virtualized-select-from-url
            ref="machineRef"
            v-model="searchParams.machineId"
            :request-fn="() => getAllMachineApi({ areaId: searchParams.areaId })"
            filterable
            value-key="id"
            clearable
            class="filter-input"
            @change="() => handleMachineChange(searchParams)"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Bộ phận</div>
          <virtualized-select-from-url
            ref="machineComponentRef"
            v-model="searchParams.machineComponentIds"
            :request-fn="() => getComponentMachineApi({ machineId: searchParams.machineId, hasMonitorPoints: false })"
            filterable
            value-key="id"
            clearable
            multiple
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">ΔPD% từ</div>
          <input-number v-model="searchParams.deltaMin" class="filter-input" />
        </div>
        <div class="filter-item">
          <div class="filter-label">ΔPD% đến</div>
          <input-number v-model="searchParams.deltaMax" class="filter-input" />
        </div>
        <div class="filter-item">
          <div class="filter-label">Đánh giá</div>
          <select-from-config
            v-model="searchParams.evaluationLevel"
            key-config="temperatureLevelList"
            clearable
            class="filter-input"
          />
        </div>
        <search-button @click="elTableRef?.refresh()" />
        <export-button @click="() => exportFile(searchParams)" :loading="isExportLoading"></export-button>
      </div>
    </template>
  </list-template>
</template>

<style scoped>
.muted {
  color: var(--text-sub);
}
</style>
