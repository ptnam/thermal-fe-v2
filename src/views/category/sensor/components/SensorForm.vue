<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '190px', rules: formRules }"
      :request-fn="isEditing ? editSensorApi : addSensorApi"
      :isEditing="isEditing"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="font-bold">Thông tin cảm biến</span>
          </div>
        </template>
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="Mã cảm biến" prop="code" :error="formErrors.Code">
              <el-input v-model="formModel.code"/>
            </el-form-item>
            <el-form-item label="Khu vực" prop="areaId" :error="formErrors.AreaId">
              <tree-select-remote
                  v-model="formModel.areaId"
                  :request-fn="getAllTreeAreaApi"
                  filterable
                  clearable
                  @node-click="handleAreaIdClick"
              />
            </el-form-item>
            <el-form-item label="Bật/ tắt" prop="deviceStatus" :error="formErrors.DeviceStatus">
              <select-from-config
                  key-config="deviceStatusList"
                  v-model="formModel.deviceStatus"
                  colValue="code"
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
                label="Địa chỉ IP (LAN)"
                prop="lanIpAddress"
                :error="formErrors.LanIpAddress"
            >
              <el-input v-model="formModel.lanIpAddress"/>
            </el-form-item>
            <el-form-item
                label="Địa chỉ IP (WAN)"
                prop="wanIpAddress"
                :error="formErrors.WanIpAddress"
            >
              <el-input v-model="formModel.wanIpAddress"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên cảm biến" prop="name" :error="formErrors.Name">
              <el-input v-model="formModel.name"/>
            </el-form-item>
            <el-form-item
                label="Nguồn nhiệt"
                prop="monitorType"
                :error="formErrors.MonitorType"
            >
              <select-from-config
                  key-config="monitorTypeList"
                  v-model="formModel.monitorType"
              />
            </el-form-item>
            <el-form-item
                label="Loại cảm biến"
                prop="sensorTypeId"
                :error="formErrors.sensorTypeId"
            >
              <virtualized-select-from-url
                  :request-fn="getAllSensorTypeApi"
                  v-model="formModel.sensorTypeId"
                  filterable
              />
            </el-form-item>
            <el-form-item label="Port" prop="port" :error="formErrors.Port">
              <InputNumber v-model="formModel.port"/>
            </el-form-item>
            <el-form-item
                v-if="formModel?.area && formModel.areaId"
                label="Tọa độ"
                :error="formErrors.Latitude ?? formErrors.Longitude"
            >
              <LatLngPicker
                  v-if="formModel?.area?.mapType === MAP_TYPE_MAP"
                  :map-config="formModel"
                  @input="setCoordinate"
              />
              <lat-lng-image-picker
                  v-if="formModel?.area?.mapType === MAP_TYPE_PICTURE"
                  :image-path="formModel?.area?.photoPath"
                  :map-config="formModel"
                  @input="setCoordinate"
              />
              <p v-if="formModel.longitude && formModel.latitude" class="m-0 whitespace-nowrap">
                <span class="font-bold">Kinh độ:</span> {{ formModel.longitude }},
                <span class="font-bold">Vĩ độ:</span> {{ formModel.latitude }}
              </p>
            </el-form-item>
            <el-form-item label="Frequency" prop="frequency" :error="formErrors.Frequency">
              <InputNumber v-model="formModel.frequency"/>
            </el-form-item>
            <el-form-item label="Slot" prop="slot" :error="formErrors.Slot">
              <InputNumber v-model="formModel.slot"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="mt-4">
        <template #header>
          <div class="card-header">
            <span class="font-bold">Danh sách điểm giám sát</span>
            <add-button @click="addSensorMonitorPoint"></add-button>
          </div>
        </template>
        <table class="table-auto border-collapse w-full">
          <thead>
          <tr>
            <th class="px-2 py-1 text-left w-[200px]">Mã</th>
            <th class="px-2 py-1 text-left w-[200px]">Tên</th>
            <th class="px-2 py-1 text-left">Ghi chú</th>
            <th class="px-2 py-1 text-left">Trạng thái</th>
            <th class="px-2 py-1 text-left w-[90x]"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in formModel.sensorMonitorPoints" :key="index">
            <td class="px-2 py-1">
              <el-form-item
                  :prop="`sensorMonitorPoints.${index}.code`"
                  :error="formErrors?.[`SensorMonitorPoints[${index}].Code`]"
                  label-position="top"
                  :rules="[rule('required', true)]"
              >
                <el-input v-model="item.code"/>
              </el-form-item>
            </td>
            <td class="px-2 py-1">
              <el-form-item
                  :prop="`sensorMonitorPoints.${index}.name`"
                  :error="formErrors?.[`SensorMonitorPoints[${index}].Name`]"
                  label-position="top"
                  :rules="[rule('required', true)]"
              >
                <el-input v-model="item.name"/>
              </el-form-item>
            </td>
            <td class="px-2 py-1">
              <el-form-item
                  :prop="`sensorMonitorPoints.${index}.note`"
                  :error="formErrors?.[`SensorMonitorPoints[${index}].Note`]"
                  label-position="top"
              >
                <el-input v-model="item.note"/>
              </el-form-item>
            </td>
            <td class="px-2 py-1">
              <el-form-item
                  :prop="`sensorMonitorPoints.${index}.status`"
                  :error="formErrors?.[`SensorMonitorPoints[${index}].Status`]"
                  label-position="top"
              >
                <select-from-config
                    key-config="commonStatusList"
                    v-model="formModel.status"
                    col-value="code"
                />
              </el-form-item>
            </td>
            <td class="px-2 py-1">
              <el-button
                  class="mb-4"
                  circle
                  type="danger"
                  @click="() => removeSensorMonitorPoint(index)"
                  :icon="Remove"
              ></el-button>
            </td>
          </tr>
          </tbody>
        </table>
      </el-card>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import {computed} from 'vue'
import {rule} from '@/utils/validate'
import {isFormEditing} from '@/utils/is'
import {FormRules} from 'element-plus'
import {addSensorApi, editSensorApi} from '@/api/sensor'
import {getAllTreeAreaApi} from '@/api/area'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import InputNumber from '@/components/Input/InputNumber.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import AddButton from '@/components/Button/AddButton.vue'
import {Remove} from '@element-plus/icons-vue'
import {getAllSensorTypeApi} from '@/api/sensor-type'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import {MAP_TYPE_MAP, MAP_TYPE_PICTURE} from "@/constants";
import LatLngPicker from "@/components/Map/LatLngPicker.vue";
import LatLngImagePicker from "@/components/Map/LatLngImagePicker.vue";

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})
const emits = defineEmits(['update:formModel', 'success'])

const isEditing = computed(() => {
  return isFormEditing(props.formModel)
})
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [rule('required', true)],
    code: [rule('required', true)],
    areaId: [rule('required', true)],
    sensorTypeId: [rule('required', true)],
    monitorType: [rule('required', true)],
  }

  return rules
})
const handleSuccess = (data: any) => {
  emits('success', data)
}

const addSensorMonitorPoint = () => {
  const form = props.formModel
  form.sensorMonitorPoints.push({})
  emits('update:formModel', form)
}
const removeSensorMonitorPoint = (index: number) => {
  const form = props.formModel
  form.sensorMonitorPoints.splice(index, 1)
  emits('update:formModel', form)
}
const updateFormModel = (node: any) => {
  emits('update:formModel', {...props.formModel, ...node})
}
const setCoordinate = (coordinate: any) => {
  updateFormModel(coordinate)
}
const handleAreaIdClick = (area: any) => {
  const form = {...props.formModel, ...{area: area, areaId: area.id}}
  emits('update:formModel', form)
}
</script>
