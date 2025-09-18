<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import PageContainer from '@/components/PageContainer.vue'
import {computed, ref} from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import {ElButton, ElTooltip} from 'element-plus'
import {Refresh, Rank, Aim} from '@element-plus/icons-vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {CAMERA_NORMAL_TYPE, STATUS_ACTIVE} from '@/constants'
import {getCameraListApi, deleteCameraApi, syncPresetsApi, listPresetsApi} from '@/api/camera'
import {getAllTreeAreaApi} from '@/api/area'
import CameraFormTab from '@/views/category/camera/components/CameraFormTab.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import TreeSelectRemote from "@/components/Tree/TreeSelectRemote.vue";
import useRequest from "@/hooks/web/useRequest";
import PresetTourTab from '@/views/category/camera/components/PresetTourTab.vue'
import CameraVisionPreset from "@/views/category/camera/components/CameraVisionPreset.vue";

const columns = computed<TableColumn[]>(() => [
  {type: 'index', label: 'STT', width: 60, headerAlign: 'center'},
  {prop: 'code', label: 'Mã camera'},
  {prop: 'name', label: 'Tên camera'},
  {prop: 'area.name', label: 'Khu vực'},
  {prop: 'cameraTypeObject.name', label: 'Chức năng camera'},
  {prop: 'deviceStatusObject.name', label: 'Trạng thái', width: '150px'},
  {
    width: '240px',
    slots: {
      default: (scope: any) => (
          <div>
            <ElTooltip content='Đồng bộ góc quay'>
              <ElButton
                  circle={true}
                  icon={Refresh}
                  onClick={() => syncPresets(scope.row)}
              />
            </ElTooltip>
            <ElTooltip content='Xem danh sách góc quay'>
              <ElButton
                  circle={true}
                  icon={Rank}
                  onClick={() => showPresets(scope.row)}
              />
            </ElTooltip>
            {scope.row.cameraType === CAMERA_NORMAL_TYPE &&
              <ElTooltip content='Chỉnh góc quay'>
                <ElButton
                    circle={true}
                    icon={Aim}
                    onClick={() => showVisionPresets(scope.row)}
                />
              </ElTooltip>
            }
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
const presets = ref([])
const cameraTours = ref([])
const presetDialogVisible = ref(false)
const presetVisionVisible = ref(false)

const {onRequest: presetRequest, isLoading: syncPresetLoading} = useRequest();
const syncPresets = (item: any) => {
  presetRequest(syncPresetsApi, item.id).then(res => {
    presets.value = res.data
    presetDialogVisible.value = true
  })
}
const showPresets = (item: any) => {
  presetRequest(listPresetsApi, item.id).then(res => {
    presets.value = res.data.presets
    cameraTours.value = res.data.cameraTours
    presetDialogVisible.value = true
  })
}

const visionCamera = ref(null);
const showVisionPresets = (item: any) => {
  presetVisionVisible.value = true
  visionCamera.value = item
}
const openDialogAdd = () => {
  formModel.value = {
    cameraType: CAMERA_NORMAL_TYPE,
    status: STATUS_ACTIVE,
  }
  dialogVisible.value = true
}
const openDialogEdit = (scope: any) => {
  formModel.value = JSON.parse(JSON.stringify(scope.row))
  dialogVisible.value = true
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteCameraApi, scope.row.id)
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}
</script>

<template>
  <page-container title="Danh sách camera" v-loading="syncPresetLoading">
    <list-template
        ref="elTableRef"
        key-list="camera-list"
        :columns="columns"
        :use-table-config="{
          fetchDataApi: getCameraListApi
        }"
        @addHandler="openDialogAdd"
    >
      <template slot="search" v-slot="{ searchParams }">
        <el-form-item label="Mã/tên camera">
          <el-input v-model="searchParams.name" clearable style="width: 160px"/>
        </el-form-item>
        <el-form-item label="Chức năng" label-width="90px">
          <select-from-config
              style="width: 230px"
              key-config="cameraTypeList"
              clearable
              v-model="searchParams.cameraType"
          ></select-from-config>
        </el-form-item>
        <el-form-item label="Khu vực" label-width="70px">
          <tree-select-remote
              v-model="searchParams.areaId"
              :request-fn="getAllTreeAreaApi"
              filterable
              clearable
          />
        </el-form-item>
      </template>
    </list-template>
    <base-dialog
        :destroy-on-close="true"
        v-model="dialogVisible"
        style="width: 1100px"
        center
        align-center
    >
      <camera-form-tab v-model:formModel="formModel" @success="saveSuccess"></camera-form-tab>
    </base-dialog>
    <base-dialog
        v-model="presetDialogVisible"
        title="Thông số góc quay"
    >
      <PresetTourTab
          :presets="presets"
          :tours="cameraTours"
      />
    </base-dialog>
    <base-dialog
        v-model="presetVisionVisible"
        :destroy-on-close="true"
        title="Thông số góc quay"
    >
      <CameraVisionPreset
          :visionCamera="visionCamera"
      />
    </base-dialog>
  </page-container>
</template>