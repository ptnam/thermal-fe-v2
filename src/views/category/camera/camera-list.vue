<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {computed, ref} from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import {ElButton, ElTooltip} from 'element-plus'
import {Refresh, Rank, Aim, Notification, Pointer} from '@element-plus/icons-vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {CAMERA_NORMAL_TYPE, STATUS_ACTIVE} from '@/constants'
import {
  getCameraListApi,
  deleteCameraApi,
  syncPresetsApi,
  getCameraDetailApi,
  listPresetsApi,
  importCameraIECApi,
  exportCameraIECApi
} from '@/api/camera'
import {getAllTreeAreaApi} from '@/api/area'
import CameraFormTab from '@/views/category/camera/components/CameraFormTab.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import useRequest from '@/hooks/web/useRequest'
import PresetTourTab from '@/views/category/camera/components/PresetTourTab.vue'
import CameraVisionPreset from '@/views/category/camera/components/CameraVisionPreset.vue'
import AiSetting from '@/views/category/camera/components/AiSetting.vue'
import SearchButton from '@/components/Button/SearchButton.vue'
import DrawerForm from '@/components/Form/DrawerForm.vue'
import {useRouter} from 'vue-router';
import {downloadFile} from "@/utils/response";
import CameraCard from '@/views/category/camera/components/CameraCard.vue'

const router = useRouter();

const columns = computed<TableColumn[]>(() => [
  {type: 'index', label: 'STT', width: 60, headerAlign: 'center'},
  {prop: 'code', label: 'Mã camera'},
  {prop: 'name', label: 'Tên camera'},
  {prop: 'area.name', label: 'Khu vực'},
  {prop: 'cameraTypeObject.name', label: 'Chức năng camera'},
  {
    prop: 'deviceStatusObject.name',
    label: 'Trạng thái',
    width: '150px',
    slots: {
      default: ({row}) => (<span style={{
        color: row.deviceStatusObject.code === 'On' ? 'var(--success)' : 'var(--danger)'
      }}>{row?.deviceStatusObject?.name}</span>)
    },
  },
  {
    width: '300px',
    slots: {
      default: (scope: any) => (
          <div>
            <ElTooltip content="Đồng bộ góc quay">
              <ElButton circle={true} icon={Refresh} onClick={() => syncPresets(scope.row)}/>
            </ElTooltip>
            <ElTooltip content="Xem danh sách góc quay">
              <ElButton circle={true} icon={Rank} onClick={() => showPresets(scope.row)}/>
            </ElTooltip>
            {scope.row.cameraType === CAMERA_NORMAL_TYPE && (
                <ElTooltip content="Chỉnh góc quay">
                  <ElButton circle={true} icon={Aim} onClick={() => showVisionPresets(scope.row)}/>
                </ElTooltip>
            )}
            <ElTooltip content="Cài đặt góc quay">
              <ElButton circle={true} icon={Pointer} onClick={() => showPresetSetting(scope.row)}/>
            </ElTooltip>
            <ElTooltip content="Cài đặt AI">
              <ElButton circle={true} icon={Notification} onClick={() => showAISetting(scope.row)}/>
            </ElTooltip>
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

const {onRequest: presetRequest, isLoading: syncPresetLoading} = useRequest()
const syncPresets = (item: any) => {
  presetRequest(syncPresetsApi, item.id).then((res) => {
    presets.value = res.data.presets
    cameraTours.value = res.data.cameraTours
    presetDialogVisible.value = true
  })
}

const showPresetSetting = (item: any) => {
  return router.push({name: 'camera_setting', params: {id: item.id}})
}

const showPresets = (item: any) => {
  presetRequest(listPresetsApi, item.id).then((res) => {
    presets.value = res.data.presets
    cameraTours.value = res.data.cameraTours
    presetDialogVisible.value = true
  })
}

const visionCamera = ref(null)
const showVisionPresets = (item: any) => {
  presetVisionVisible.value = true
  visionCamera.value = item
}

const aiSettingDialogVisible = ref(false)
const selectedCamera = ref()
const showAISetting = (row: object) => {
  aiSettingDialogVisible.value = true
  selectedCamera.value = row
}
const openDialogAdd = () => {
  formModel.value = {
    cameraType: CAMERA_NORMAL_TYPE,
    status: STATUS_ACTIVE,
  }
  dialogVisible.value = true
}

const detailLoading = ref(false);
const openDialogEdit = (scope: any) => {
  detailLoading.value = true
  getCameraDetailApi(scope.row.id)
      .then((res) => {
        formModel.value = res.data
        dialogVisible.value = true
      })
      .finally(() => {
        detailLoading.value = false
      })
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteCameraApi, scope.row.id)
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
  requestExport(exportCameraIECApi, searchParams).then((res) => {
    downloadFile(res)
  })
}

const uploadApi = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return importCameraIECApi(formData)
}
</script>

<template>
  <div v-loading="syncPresetLoading">
    <list-template
        ref="elTableRef"
        key-list="camera-list"
        :columns="columns"
        :card-component="CameraCard"
        :use-table-config="{
          fetchDataApi: getCameraListApi,
        }"
        :search-props="{
          className: ''
        }"
        @addHandler="openDialogAdd"
        title="Danh sách camera"
        @syncPresets="syncPresets"
        @showPresets="showPresets"
        @edit="openDialogEdit"
        @delete="openDelete"
        @showPresetSetting="showPresetSetting"
        @showAISetting="showAISetting"
    >
      <template slot="search" v-slot="{ searchParams, tableMethods }">
        <div class="filter-row">
          <div class="filter-item">
            <div class="filter-label">Mã/tên camera</div>
            <el-input v-model="searchParams.name" class="filter-input" clearable placeholder="Nhập mã hoặc tên..."/>
          </div>
          <div class="filter-item">
            <div class="filter-label">Chức năng</div>
            <select-from-config
                class="filter-input"
                key-config="cameraTypeList"
                clearable
                v-model="searchParams.cameraType"
            ></select-from-config>
          </div>
          <div class="filter-item">
            <div class="filter-label">Khu vực</div>
            <tree-select-remote
                class="filter-input"
                v-model="searchParams.areaId"
                :request-fn="getAllTreeAreaApi"
                filterable
                clearable
            />
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
    <drawer-form
        :destroy-on-close="true"
        v-model="dialogVisible"
        style="width: 1100px"
        center
        align-center
    >
      <camera-form-tab
          v-model:formModel="formModel"
          @success="saveSuccess"
          v-loading="detailLoading"
      ></camera-form-tab>
    </drawer-form>
    <base-dialog v-model="presetDialogVisible" title="Thông số góc quay">
      <PresetTourTab :presets="presets" :tours="cameraTours"/>
    </base-dialog>
    <base-dialog
        v-model="presetVisionVisible"
        :destroy-on-close="true"
        title="Thông số góc quay"
        style="min-width: 850px"
    >
      <CameraVisionPreset :visionCamera="visionCamera"/>
    </base-dialog>
    <drawer-form v-model="aiSettingDialogVisible" :destroy-on-close="true" title="Cài đặt AI" style="min-width: 650px">
      <ai-setting :camera="selectedCamera" @saved="aiSettingDialogVisible = false"/>
    </drawer-form>
  </div>
</template>
