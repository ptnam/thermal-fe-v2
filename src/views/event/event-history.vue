<script setup lang="tsx">
import { useLang } from '@/hooks/web/useI18n'
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import { nextTick, onMounted, onUnmounted, ref, computed } from 'vue'
import { getAllTreeAreaApi } from '@/api/area'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import SearchButton from '@/components/Button/SearchButton.vue'
import ExportButton from '@/components/Button/ExportButton.vue'
import { listThermalsApi, thermalExportApi } from '@/api/thermal-data'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import dayjs from 'dayjs'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import InputNumber from '@/components/Input/InputNumber.vue'
import useRequest from '@/hooks/web/useRequest'
import { STATUS_COLOR_MAP } from '@/constants'
import _ from 'lodash'
import { ElMessage } from 'element-plus'
import {
  createSignalRConnection,
  invokeSignalR,
  onSignalREvent,
  startSignalR,
  stopSignalR,
} from '@/plugins/signalr'
import { downloadByPathApi } from '@/api/common'
import { downloadFile } from '@/utils/response'
import EventHistoryCard from '@/views/event/components/EventHistoryCard.vue'

const { t } = useLang()

const defaultCols = () => [
  { prop: 'dateData', label: t('alert.date'), width: 160, align: 'center' },
  { prop: 'timeData', label: t('alert.hour'), align: 'center' },
  { prop: 'areaName', label: t('fields.area'), align: 'center', minWidth: 160,  },
  { prop: 'machineName', label: t('alert.equipment'), align: 'center' },
  { prop: 'machineComponentName', label: t('alert.component'), align: 'center', minWidth: 120, },
  { prop: 'monitorPointCode', label: t('alert.thermalPoint'), align: 'center', minWidth: 120, },
  { prop: 'maxTemperature', label: t('alert.temperature'), align: 'center', minWidth: 100, },
]
// Cột động theo từng kiểu so sánh có trong dữ liệu; computed để đổi nhãn theo ngôn ngữ
const mergedResults = ref<Record<string, any>>({})
const buildOtherCols = (merged: Record<string, any>) => {
  const otherCols: any[] = []
  for (const key in merged) {
    const value = merged[key]
    otherCols.push({
      label: value?.compareTypeObject?.name ?? '',
      align: 'center',
      children: [
        { prop: `dicThermalDataResults.${key}.compareValue`, label: '°C', align: 'center' },
        { prop: `dicThermalDataResults.${key}.deltaValue`, label: t('alert.delta'), align: 'center', width: '110' },
        {
          prop: `dicThermalDataResults.${key}.compareComponent`,
          label: t('alert.compareObjectShort'),
          minWidth: '120px',
          align: 'center',
          width: '110',
          hidden: ['Enviroment', 'Threshold'].includes(value?.compareTypeObject?.code),
        },
        {
          prop: `dicThermalDataResults.${key}.compareResultObject.name`,
          label: t('fields.status'),
          align: 'center',
          width: 120,
          slots: {
            default: ({row}) => {
              const code = row?.dicThermalDataResults?.[key]?.compareResultObject?.code ?? ''
              const backgroundColor = STATUS_COLOR_MAP[code]
              return (<span class="status-badge" style={{backgroundColor: backgroundColor}}>{row?.dicThermalDataResults[key]?.compareResultObject?.name}</span>)
            }
          },
        },
      ],
    })
  }
  return otherCols
}
const columns = computed(() => [...defaultCols(), ...buildOtherCols(mergedResults.value)])

const elTableRef = ref<ComponentRef<typeof ListTemplate>>()

const machineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
// const machineComponentRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const groupFields = ['dateData', 'timeData', 'areaName', 'machineName', 'orderNumber']
function convertToTableData(items) {
  const sorted = _.orderBy(
    items,
    ['dateData', 'timeData', 'areaName', 'machineName', 'orderNumber'],
    ['desc', 'desc', 'asc', 'asc', 'asc'],
  )

  const tableData = [...sorted]
  if (tableData.length) {
    for (let fieldIndex = 0; fieldIndex < groupFields.length; fieldIndex++) {
      const field = groupFields[fieldIndex]
      let groupStartIndex = 0

      for (let i = 0; i <= tableData.length; i++) {
        const current = tableData[i]?.[field]
        const prev = tableData[groupStartIndex]?.[field]

        const isSameGroup =
          i < tableData.length &&
          current === prev &&
          groupFields
            .slice(0, fieldIndex)
            .every((key) => tableData[i][key] === tableData[groupStartIndex][key])

        if (!isSameGroup) {
          tableData[groupStartIndex][`rowspan_${fieldIndex}`] = i - groupStartIndex
          for (let j = groupStartIndex + 1; j < i; j++) {
            tableData[j][`rowspan_${fieldIndex}`] = 0
          }
          groupStartIndex = i
        }
      }
    }
  }

  return tableData
}

const formatDataList = (rows: any[]) => {
  const tmpRows = convertToTableData(rows)
  const merged = tmpRows.reduce((acc, row) => {
    return { ...acc, ...row?.dicThermalDataResults }
  }, {})
  mergedResults.value = merged
  return tmpRows
}
const objectSpanMethod = ({ row, column, columnIndex }) => {
  if (groupFields.includes(column.property)) {
    const rowspan = row?.[`rowspan_${columnIndex}`] ?? 0
    return {
      rowspan,
      colspan: rowspan === 0 ? 0 : 1,
    }
  }

  return {
    rowspan: 1,
    colspan: 1,
  }
}
// const cellStyle = (data: { row: any; column: any; rowIndex: number; columnIndex: number }) => {
//   const key = data.column.property
//   if (key.includes('compareResultObject')) {
//     const field = key.split('.')[1]
//     const code = data.row?.dicThermalDataResults?.[field]?.compareResultObject?.code ?? ''
//     const backgroundColor = STATUS_COLOR_MAP[code]
//     return {
//       backgroundColor,
//       color: backgroundColor ? 'white' : 'inherit',
//     }
//   }
// }

const handleAreaChange = (searchParams: any) => {
  nextTick(() => {
    searchParams.machineComponentId = null
    searchParams.machineId = null
    machineRef?.value?.fetch()
  })
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
const { onRequest } = useRequest()
const exportFile = (searchParams: any) => {
  isExportLoading.value = true
  onRequest(thermalExportApi, searchParams).then((res) => {
    invokeSignalR('RegisterJob', res.jobId)
    ElMessage.success(t('alert.exportStarted'))
  })
}
</script>

<template>
    <list-template
      ref="elTableRef"
      :title="t('alert.temperatureLogTitle')"
      key-list="event-history"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: listThermalsApi,
        formatDataList: formatDataList,
        searchDefaults: {
          fromTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD 00:00:00'),
          toTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        },
      }"
      :search-props="{ visibleSearchButton: false, inline: false, className:'' }"
      :span-method="objectSpanMethod"
      :show-btn-add="false"
      :card-component="EventHistoryCard"
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
            <div class="filter-label">{{ t('alert.compareMode') }}</div>
            <select-from-config
              v-model="searchParams.thresholdType"
              key-config="thresholdTypeList"
              clearable
              class="filter-input"
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">{{ t('alert.from') }}</div>
            <input-number v-model="searchParams.deltaMin" class="filter-input" />
          </div>
          <div class="filter-item">
            <div class="filter-label">{{ t('alert.to') }}</div>
            <input-number v-model="searchParams.deltaMax" class="filter-input" />
          </div>
          <div class="filter-item">
            <div class="filter-label">{{ t('alert.evaluation') }}</div>
            <select-from-config
              v-model="searchParams.temperatureLevel"
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
