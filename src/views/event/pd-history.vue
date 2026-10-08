<script setup lang="tsx">
import { useLang } from '@/hooks/web/useI18n'
import { enumLabel } from '@/utils/enumLabel'
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue'
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

const { t } = useLang()

// Kiểu so sánh (7/8) THỰC SỰ đã dùng - xem pd-notification-system.vue / PdDataRepository.ClassifyPdReadingAsync.
const PD_LEVEL_DB_ID = 8
function pdCriteriaLabel(row: any) {
  return row.evaluationThresholdType === PD_LEVEL_DB_ID ? t('pd.criteriaDb') : t('pd.criteriaGrowth')
}
function pdUnit(row: any) {
  return row.evaluationThresholdType === PD_LEVEL_DB_ID ? 'dB' : '%'
}

const columns = computed(() => [
  {prop: 'dateData', label: t('alert.date'), width: 130, align: 'center'},
  {prop: 'timeData', label: t('alert.hour'), width: 110, align: 'center'},
  {prop: 'areaName', label: t('fields.area'), minWidth: 180, align: 'center'},
  {prop: 'cameraCode', label: 'Camera', width: 130, align: 'center'},
  {prop: 'zoneName', label: t('dashboard.cameraZone'), width: 150, align: 'center'},
  {prop: 'machineName', label: t('alert.equipment'), width: 130, align: 'center'},
  {prop: 'machineComponentName', label: t('alert.component'), width: 150, align: 'center'},
  {
    label: t('alert.alertMode'),
    width: 230,
    align: 'center',
    slots: {default: ({row}) => <span>{pdCriteriaLabel(row)}</span>},
  },
  {
    prop: 'appliedFormulaName',
    label: t('pd.appliedFormula'),
    width: 170,
    align: 'center',
    slots: {
      default: ({row}) => row.evaluationThresholdType !== PD_LEVEL_DB_ID
        ? <span>{row.appliedFormulaName ?? t('pd.systemDefault')}</span>
        : <span class="muted">—</span>,
    },
  },
  {
    prop: 'levelDb',
    label: t('pd.intensity'),
    width: 130,
    align: 'center',
    slots: {default: ({row}) => <span>{row.levelDb} dB</span>},
  },
  {
    prop: 'referenceValue',
    label: t('pd.referenceValue'),
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
    label: t('alert.delta'),
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
    label: t('alert.evaluation'),
    width: 130,
    align: 'center',
    slots: {
      default: ({row}) => {
        const code = row?.evaluationLevelObject?.code ?? ''
        return code
          ? <span class="status-badge" style={{backgroundColor: STATUS_COLOR_MAP[code]}}>{enumLabel('temperatureLevelList', code, row.evaluationLevelObject.name)}</span>
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
    ElMessage.success(t('alert.exportStarted'))
  })
}
</script>

<template>
  <list-template
    ref="elTableRef"
    :title="t('pd.historyTitle')"
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
          <div class="filter-label">{{ t('alert.timeFrom') }}</div>
          <el-date-picker
            v-model="searchParams.fromTime"
            type="datetime"
            :placeholder="t('alert.startTime')"
            format="YYYY/MM/DD hh:mm:ss A"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ t('alert.timeTo') }}</div>
          <el-date-picker
            v-model="searchParams.toTime"
            type="datetime"
            :placeholder="t('alert.endTime')"
            format="YYYY/MM/DD hh:mm:ss A"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ t('fields.area') }}</div>
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
          <div class="filter-label">{{ t('alert.equipment') }}</div>
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
          <div class="filter-label">{{ t('alert.component') }}</div>
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
          <div class="filter-label">{{ t('pd.growthFrom') }}</div>
          <input-number v-model="searchParams.deltaMin" class="filter-input" />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ t('pd.growthTo') }}</div>
          <input-number v-model="searchParams.deltaMax" class="filter-input" />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ t('alert.evaluation') }}</div>
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
