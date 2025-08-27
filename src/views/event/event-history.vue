<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import PageContainer from '@/components/PageContainer.vue'
import { nextTick, onMounted, ref } from 'vue'
import { getAllTreeAreaApi } from '@/api/area'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import SearchButton from '@/components/Button/SearchButton.vue'
import ExportButton from '@/components/Button/ExportButton.vue'
import { listThermalsApi, thermalExportApi } from '@/api/thermal-data'
import { getAllMachineApi, getComponentMachineApi } from '@/api/machine'
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
} from '@/plugins/signalr'
import { downloadByPathApi } from '@/api/common'
import { downloadFile } from '@/utils/response'

const defaultCols = [
  { prop: 'dateData', label: 'Ngày', width: 160, align: 'center' },
  { prop: 'timeData', label: 'Giờ', align: 'center' },
  { prop: 'areaName', label: 'Khu vực', align: 'center' },
  { prop: 'machineName', label: 'Thiết bị', align: 'center' },
  { prop: 'machineComponentName', label: 'Bộ phận', align: 'center' },
  { prop: 'monitorPointCode', label: 'Điểm nhiệt', align: 'center' },
  { prop: 'maxTemperature', label: 'Nhiệt độ', align: 'center' },
]
const columns = ref(defaultCols)

const elTableRef = ref<ComponentRef<typeof ListTemplate>>()

const machineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const machineComponentRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
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
  const otherCols: any[] = []
  for (const key in merged) {
    const value = merged[key]
    otherCols.push({
      label: value?.compareTypeObject?.name ?? '',
      align: 'center',
      children: [
        { prop: `dicThermalDataResults.${key}.compareValue`, label: '°C', align: 'center' },
        { prop: `dicThermalDataResults.${key}.deltaValue`, label: 'Chênh lệch', align: 'center' },
        {
          prop: `dicThermalDataResults.${key}.compareComponent`,
          label: 'Đ.tượng SS',
          align: 'center',
          hidden: ['Enviroment', 'Threshold'].includes(value?.compareTypeObject?.code),
        },
        {
          prop: `dicThermalDataResults.${key}.compareResultObject.name`,
          label: 'Trạng thái',
          align: 'center',
        },
      ],
    })
  }
  columns.value = [...defaultCols, ...otherCols]
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
const cellStyle = (data: { row: any; column: any; rowIndex: number; columnIndex: number }) => {
  const key = data.column.property
  if (key.includes('compareResultObject')) {
    const field = key.split('.')[1]
    const code = data.row?.dicThermalDataResults?.[field]?.compareResultObject?.code ?? ''
    const backgroundColor = STATUS_COLOR_MAP[code]
    return {
      backgroundColor,
      color: backgroundColor ? 'white' : 'inherit',
    }
  }
}

const handleAreaChange = (searchParams: any) => {
  nextTick(() => {
    searchParams.machineComponentId = null
    searchParams.machineId = null
    machineRef?.value?.fetch()
  })
}

const machineChange = (searchParams: any) => {
  searchParams.machineComponentId = null
  machineComponentRef?.value?.fetch()
}

onMounted(() => {
  createSignalRConnection()
  startSignalR()
  onSignalREvent('exportCompleted', function (jobId: any) {
    downloadByPathApi(`/api/Export/download/${jobId}`).then((res) => {
      downloadFile(res)
    })
  })
})

const { onRequest, isLoading } = useRequest()
const exportFile = (searchParams: any) => {
  onRequest(thermalExportApi, searchParams).then((res) => {
    invokeSignalR('RegisterJob', res.jobId)
    ElMessage.success('File sẽ tự động download sau khi đã xuất xong')
  })
}
</script>

<template>
  <page-container title="Nhật ký nhiệt độ">
    <list-template
      ref="elTableRef"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: listThermalsApi,
        formatDataList: formatDataList,
        searchDefaults: {
          fromTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD 00:00:00'),
          toTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        },
      }"
      :search-props="{ visibleSearchButton: false, inline: false }"
      :span-method="objectSpanMethod"
      :cell-style="cellStyle"
    >
      <template v-slot:top><span></span></template>
      <template slot="search" v-slot="{ searchParams }">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Thời gian từ">
              <el-date-picker
                v-model="searchParams.fromTime"
                type="datetime"
                placeholder="Thời gian bắt đầu"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-[-webkit-fill-available]"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Thời gian đến">
              <el-date-picker
                v-model="searchParams.toTime"
                type="datetime"
                placeholder="Thời gian kết thúc"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-[-webkit-fill-available]"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Khu vực">
              <tree-select-remote
                v-model="searchParams.areaId"
                :requestFn="getAllTreeAreaApi"
                filterable
                clearable
                @node-click="() => handleAreaChange(searchParams)"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8" v-show="searchParams.areaId">
            <el-form-item label="Thiết bị">
              <virtualized-select-from-url
                ref="machineRef"
                v-model="searchParams.machineId"
                :request-fn="() => getAllMachineApi({ areaId: searchParams.areaId })"
                filterable
                value-key="id"
                col-label="name"
                :default-first-option="true"
                clearable
                @change="() => machineChange(searchParams)"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8" v-show="searchParams.machineId">
            <el-form-item label="Bộ phận">
              <virtualized-select-from-url
                ref="machineComponentRef"
                v-model="searchParams.machineComponentId"
                :request-fn="() => getComponentMachineApi({ machineId: searchParams.machineId })"
                filterable
                value-key="id"
                :default-first-option="true"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Kiểu so sánh">
              <select-from-config
                v-model="searchParams.thresholdType"
                key-config="thresholdTypeList"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Từ">
              <input-number v-model="searchParams.deltaMin" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Đến">
              <input-number v-model="searchParams.deltaMax" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Đánh giá">
              <select-from-config
                v-model="searchParams.temperatureLevel"
                key-config="temperatureLevelList"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="flex justify-center">
          <search-button @click="elTableRef?.refresh()" />
          <export-button @click="() => exportFile(searchParams)" :loading="isLoading" />
        </div>
      </template>
    </list-template>
  </page-container>
</template>
