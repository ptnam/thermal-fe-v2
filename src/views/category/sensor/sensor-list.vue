<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'
import {computed, ref} from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import {DEVICE_STATUS_ON, STATUS_ACTIVE} from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import {getAllTreeAreaApi} from '@/api/area'
import SensorForm from '@/views/category/sensor/components/SensorForm.vue'
import {deleteSensorApi, exportSensorsIECApi, getSensorListApi, importSensorsIECApi} from '@/api/sensor'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {getAllSensorTypeApi} from '@/api/sensor-type'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import SearchButton from '@/components/Button/SearchButton.vue'
import useRequest from "@/hooks/web/useRequest";
import {exportCameraIECApi, importCameraIECApi} from "@/api/camera";
import {downloadFile} from "@/utils/response";
import {ElButton} from "element-plus";

const {t} = useLang()

const columns = computed<TableColumn[]>(() => [
  {type: 'index', width: 60},
  {prop: 'code', label: 'Mã cảm biến'},
  {prop: 'name', label: 'Tên cảm biến'},
  {prop: 'area.name', label: 'Khu vực'},
  {
    prop: 'deviceStatusObject.name',
    width: 160,
    label: 'Trạng thái',
    slots: {
      default: ({row}) => (<span style={{
        color: row.deviceStatusObject.code === 'On' ? 'var(--success)' : 'var(--danger)'
      }}>{row?.deviceStatusObject?.name}</span>)
    },
  },
  {
    label: t('fields.action'),
    width: '110px',
    slots: {
      default: (scope: any) => (
          <div>
            <EditCircleButton onClick={() => openDialogEdit(scope)}></EditCircleButton>
            <DeleteCircleButton onClick={() => openDelete(scope)}></DeleteCircleButton>
          </div>
      ),
    },
  },
])
const dialogVisible = ref(false)
const elTableRef = ref<InstanceType<typeof ListTemplate>>()

const formModel = ref({})

const openDialogAdd = () => {
  formModel.value = {
    deviceStatus: DEVICE_STATUS_ON,
    sensorMonitorPoints: [],
    status: STATUS_ACTIVE,
  }
  dialogVisible.value = true
}
const openDialogEdit = (scope: any) => {
  formModel.value = JSON.parse(JSON.stringify(scope.row))
  dialogVisible.value = true
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteSensorApi, scope.row.id)
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}


const {onRequest: requestExport, isLoading: isLoadingExport} = useRequest()

const visibleUpload = ref(false);
const showImport = () => {
  visibleUpload.value = true
}

const exportEICFile = (searchParams: any) => {
  requestExport(exportSensorsIECApi, searchParams).then((res) => {
    downloadFile(res)
  })
}

const uploadApi = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return importSensorsIECApi(formData)
}
</script>

<template>
  <list-template
      ref="elTableRef"
      key-list="sensor-list"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: getSensorListApi,
      }"
      :search-props="{
        className: ''
      }"
      @addHandler="openDialogAdd"
      title="Danh sách cảm biến nhiệt"
  >
    <template slot="search" v-slot="{ searchParams, tableMethods }">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">Mã/tên cảm biến</div>
          <el-input v-model="searchParams.name" clearable class="filter-input" placeholder="Nhập mã hoặc tên..."/>
        </div>
        <div class="filter-item">
          <div class="filter-label">Khu vực</div>
          <tree-select-remote
              v-model="searchParams.areaId"
              :request-fn="getAllTreeAreaApi"
              filterable
              clearable
              class="filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Loại cảm biến</div>
          <virtualized-select-from-url
              :request-fn="getAllSensorTypeApi"
              v-model="searchParams.sensorTypeId"
              clearable
              filterable
              class="filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Trạng thái</div>
          <select-from-config
              key-config="userStatusList"
              v-model="searchParams.status"
              clearable
              class="filter-input"
          ></select-from-config>
        </div>
        <search-button @click="tableMethods.getList"></search-button>
        <el-button class="!h-[40px]" @click="() => exportEICFile(searchParams)" :loading="isLoadingExport">Export
        </el-button>
        <el-button class="!h-[40px]" @click="showImport">Import IEC</el-button>
      </div>
    </template>
  </list-template>
  <base-dialog
      v-model="visibleUpload"
      title="Import IEC"
      width="500px"
  >
    <base-upload
        :api="uploadApi"
        @success="() => visibleUpload = false"
    ></base-upload>
  </base-dialog>
  <base-dialog v-model="dialogVisible" :destroy-on-close="true" style="width: 1100px">
    <sensor-form v-model:formModel="formModel" @success="saveSuccess"></sensor-form>
  </base-dialog>
</template>

<style lang="scss" scoped></style>
