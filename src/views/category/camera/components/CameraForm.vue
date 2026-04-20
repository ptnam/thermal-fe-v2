<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '190px', rules: formRules, labelPosition: isMobile ? 'top' : 'left' }"
      :request-fn="isEditing ? editCameraApi : addCameraApi"
      :isEditing="isEditing"
      @success="handleSuccess"
      :transform-form-data="transformFormData"
      :visibleCloseDrawer="false"
  >
    <template v-slot="{ formErrors }">
      <el-row :gutter="30">
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="Mã camera" prop="code" :error="formErrors.Code">
            <el-input v-model="formModel.code"/>
          </el-form-item>
          <el-form-item label="Chức năng camera" prop="cameraType" :error="formErrors.CameraType">
            <select-from-config
                key-config="cameraTypeList"
                v-model="formModel.cameraType"
                col-value="code"
            />
          </el-form-item>
          <el-form-item label="Khu vực" prop="areaId" :error="formErrors.AreaId">
            <tree-select-remote
                v-model="formModel.areaId"
                :request-fn="getAllTreeAreaApi"
                filterable
                clearable
            />
          </el-form-item>
          <el-form-item
              label="Tần suất kiểm tra (giây)"
              prop="frequency"
              :error="formErrors.Frequency"
          >
            <input-number v-model="formModel.frequency"/>
          </el-form-item>
          <el-form-item
              v-show="formModel.cameraType === CAMERA_NORMAL_TYPE"
              label="Camera tích hợp"
              prop="IntegratedCamId"
              :error="formErrors.IntegratedCamId"
          >
            <virtualized-select-from-url
                :request-fn="getAllCamerasApi"
                v-model="formModel.integratedCamId"
                col-value="id"
                col-label="name"
            />
          </el-form-item>
          <el-form-item label="Username" prop="username" :error="formErrors.Username">
            <el-input v-model="formModel.username" autocomplete="new-password"/>
          </el-form-item>
          <el-form-item label="password" prop="password" :error="formErrors.Password">
            <el-input v-model="formModel.password" type="password" autocomplete="new-password"/>
          </el-form-item>
        </el-col>
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="Tên camera" prop="name" :error="formErrors.Name">
            <el-input v-model="formModel.name"/>
          </el-form-item>
          <el-form-item
              label="Loại camera"
              prop="ptzType"
              :error="formErrors.PtzType"
          >
            <select-from-config
                key-config="cameraPtzTypeList"
                v-model="formModel.ptzType"
                col-value="code"
            />
          </el-form-item>
          <el-form-item label="Đường dẫn camera" prop="cameraLink" :error="formErrors.CameraLink">
            <el-input v-model="formModel.cameraLink"/>
          </el-form-item>
          <el-form-item
              label="Địa chỉ IP (LAN)"
              prop="lanIpAddress"
              :error="formErrors.LanIpAddress"
          >
            <el-input v-model="formModel.lanIpAddress"/>
          </el-form-item>
          <el-form-item label="Địa chỉ IP (WAN)" prop="cameraLink" :error="formErrors.WanIpAddress">
            <el-input v-model="formModel.wanIpAddress"/>
          </el-form-item>
          <el-form-item
              label="Hãng camera"
              prop="brand"
              :error="formErrors.Brand"
          >
            <select-from-config
                key-config="cameraBrandList"
                v-model="formModel.brand"
                col-value="code"
            />
          </el-form-item>
          <el-form-item
              label="Trạng thái"
              prop="status"
              :error="formErrors.Status"
          >
            <select-from-config
                key-config="commonStatusList"
                v-model="formModel.status"
                col-value="code"
            />
          </el-form-item>
          <el-form-item
              label="Địa chỉ IEC"
              prop="iecObjectAddress"
              :error="formErrors.IecObjectAddress"
          >
            <input-number v-model="formModel.iecObjectAddress"></input-number>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {computed} from 'vue'
import {rule} from '@/utils/validate'
import {FormRules} from 'element-plus'
import {getAllTreeAreaApi} from '@/api/area'
import {addCameraApi, editCameraApi, getAllCamerasApi} from '@/api/camera'
import InputNumber from '@/components/Input/InputNumber.vue'
import {CAMERA_NORMAL_TYPE, CAMERA_THERMAL_TYPE, MAP_TYPE_PICTURE} from '@/constants'
import VirtualizedSelectFromUrl from "@/components/Selection/VirtualizedSelectFromUrl.vue";
import {removeAllObjectInObject} from "@/utils/objectUtils";
import TreeSelectRemote from "@/components/Tree/TreeSelectRemote.vue";
import LatLngImagePicker from "@/components/Map/LatLngImagePicker.vue";
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile)

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    code: [rule('required', true, 'code')],
    name: [rule('required', true, 'name')],
    areaId: [rule('required', true, 'areaId')],
    cameraType: [rule('required', true, 'cameraType')],
    cameraLink: [rule('required', true, 'cameraLink')],
    lanIpAddress: [rule('required', true, 'lanIpAddress')],
    wanIpAddress: [rule('required', true, 'wanIpAddress')],
  }
  if (props.formModel.cameraType === CAMERA_NORMAL_TYPE) {
    rules.integratedCamId = [rule('required', true, 'IntegratedCamId')]
  } else if (props.formModel.cameraType === CAMERA_THERMAL_TYPE) {
    rules.frequency = [rule('required', true, 'frequency')]
  }

  return rules
})
const transformFormData = (formData: any) => {
  return removeAllObjectInObject(formData)
}

const emit = defineEmits(['update:formModel', 'success'])
const handleSuccess = (data: any) => {
  emit('success', data)
}
const updateFormModel = (node: any) => {
  emit('update:formModel', {...props.formModel, ...node})
}
const setCoordinate = (coordinate: any) => {
  updateFormModel(coordinate)
}
</script>
