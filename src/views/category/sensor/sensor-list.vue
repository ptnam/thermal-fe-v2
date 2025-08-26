<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import { TableColumn } from '@/components/Table'
import { useLang } from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import { computed, ref } from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import { DEVICE_STATUS_ON, STATUS_ACTIVE } from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import { getAllTreeAreaApi } from '@/api/area'
import SensorForm from '@/views/category/sensor/components/SensorForm.vue'
import { deleteSensorApi, getSensorListApi } from '@/api/sensor'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import { getAllSensorTypeApi } from '@/api/sensor-type'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'

const { t } = useLang()

const columns = computed<TableColumn[]>(() => [
  { type: 'index', width: 60 },
  { prop: 'code', label: 'Mã cảm biến' },
  { prop: 'name', label: 'Tên cảm biến' },
  { prop: 'area.name', label: 'Khu vực' },
  { prop: 'deviceStatusObject.name', width: 160, label: 'Trạng thái' },
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
</script>

<template>
  <page-container title="Danh sách cảm biến nhiệt">
    <list-template
      ref="elTableRef"
      key-list="sensor-list"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: getSensorListApi,
      }"
      @addHandler="openDialogAdd"
    >
      <template slot="search" v-slot="{ searchParams }">
        <el-form-item label="Mã/tên cảm biến">
          <el-input v-model="searchParams.name" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="Khu vực" label-width="70px">
          <tree-select-remote
            v-model="searchParams.areaId"
            :request-fn="getAllTreeAreaApi"
            filterable
            clearable
          />
        </el-form-item>
        <el-form-item label="Loại cảm biến" label-width="110px">
          <virtualized-select-from-url
            :request-fn="getAllSensorTypeApi"
            v-model="searchParams.sensorTypeId"
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item :label="t('fields.status')" label-width="80px">
          <select-from-config
            style="width: 180px"
            key-config="userStatusList"
            v-model="searchParams.status"
            clearable
          ></select-from-config>
        </el-form-item>
      </template>
    </list-template>
    <base-dialog v-model="dialogVisible" :destroy-on-close="true" style="width: 1100px">
      <sensor-form v-model:formModel="formModel" @success="saveSuccess"></sensor-form>
    </base-dialog>
  </page-container>
</template>

<style lang="scss" scoped></style>
