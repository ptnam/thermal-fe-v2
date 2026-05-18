<template>
  <FormWrapper
    :form-model="formModel"
    :form-props="{
      labelWidth: '140px',
      rules: formRules,
      labelPosition: isMobile ? 'top' : 'left',
    }"
    :request-fn="isEditing ? editSensorApi : addSensorApi"
    :isEditing="isEditing"
    @success="handleSuccess"
    :visibleCloseDrawer="false"
    class-drawer="drawer drawer-md !p-0"
    classDrawerBody="drawer-body mt-2 !p-0"
  >
    <template v-slot="{ formErrors }">
      <div class="modal-split-layout flex flex-col md:flex-row gap-2">
        <div class="modal-left-col">
          <el-row :gutter="30">
            <el-col :span="isMobile ? 24 : 12">
              <el-form-item label="Mã cảm biến" prop="code" :error="formErrors.Code">
                <el-input v-model="formModel.code" />
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
              <el-form-item label="Trạng thái" prop="status" :error="formErrors.Status">
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
                <el-input v-model="formModel.lanIpAddress" />
              </el-form-item>
              <el-form-item
                label="Địa chỉ IP (WAN)"
                prop="wanIpAddress"
                :error="formErrors.WanIpAddress"
              >
                <el-input v-model="formModel.wanIpAddress" />
              </el-form-item>
              <el-form-item
                label="Chu kỳ lấy dữ liệu"
                prop="frequency"
                :error="formErrors.Frequency"
              >
                <InputNumber v-model="formModel.frequency" />
              </el-form-item>
              <el-form-item
                label="Độ dài dữ liệu"
                prop="numberOfPoints"
                :error="formErrors.NumberOfPoints"
              >
                <InputNumber v-model="formModel.numberOfPoints" />
              </el-form-item>
              <el-form-item
                label="Địa chỉ IEC"
                prop="iecObjectAddress"
                :error="formErrors.IecObjectAddress"
              >
                <input-number v-model="formModel.iecObjectAddress"></input-number>
              </el-form-item>
            </el-col>
            <el-col :span="isMobile ? 24 : 12">
              <el-form-item label="Tên cảm biến" prop="name" :error="formErrors.Name">
                <el-input v-model="formModel.name" />
              </el-form-item>
              <el-form-item label="Nguồn nhiệt" prop="monitorType" :error="formErrors.MonitorType">
                <select-from-config key-config="monitorTypeList" v-model="formModel.monitorType" />
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
                <InputNumber v-model="formModel.port" />
              </el-form-item>
              <el-form-item label="Vị trí dữ liệu" prop="slot" :error="formErrors.Slot">
                <InputNumber v-model="formModel.slot" />
              </el-form-item>
              <el-form-item label="Slave ID" prop="slaveId" :error="formErrors.SlaveId">
                <InputNumber v-model="formModel.slaveId" />
              </el-form-item>
              <el-form-item label="Protocol" prop="protocol" :error="formErrors.Protocol">
                <select-from-config key-config="modbusProtocolList" v-model="formModel.protocol" />
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
                <p
                  v-if="formModel.longitude && formModel.latitude"
                  class="m-0 whitespace-nowrap"
                  style="font-size: 12px"
                >
                  <span class="font-bold">Kinh độ:</span> {{ formModel.longitude }},
                  <span class="font-bold">Vĩ độ:</span> {{ formModel.latitude }}
                </p>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="modal-right-col">
          <div class="card-header">
            <span class="font-bold">Danh sách điểm giám sát</span>
            <add-button @click="addSensorMonitorPoint"></add-button>
          </div>
          <table class="points-table-modal table-auto border-collapse w-full">
            <thead class="hidden md:table-header-group">
              <tr>
                <th class="px-2 py-1 text-left min-w-[120px]">Mã</th>
                <th class="px-2 py-1 text-left min-w-[120px]">Tên</th>
                <th class="px-2 py-1 text-left min-w-[130px]">Trạng thái</th>
                <th class="px-2 py-1 text-left min-w-[90x]"></th>
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
                    <el-input v-model="item.code" />
                  </el-form-item>
                </td>
                <td class="px-2 py-1">
                  <el-form-item
                    :prop="`sensorMonitorPoints.${index}.name`"
                    :error="formErrors?.[`SensorMonitorPoints[${index}].Name`]"
                    label-position="top"
                    :rules="[rule('required', true)]"
                  >
                    <el-input v-model="item.name" />
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
                      v-model="item.status"
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
        </div>
      </div>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import { computed } from 'vue'
import { rule } from '@/utils/validate'
import { isFormEditing } from '@/utils/is'
import { FormRules } from 'element-plus'
import { addSensorApi, editSensorApi } from '@/api/sensor'
import { getAllTreeAreaApi } from '@/api/area'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import InputNumber from '@/components/Input/InputNumber.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import AddButton from '@/components/Button/AddButton.vue'
import { Remove } from '@element-plus/icons-vue'
import { getAllSensorTypeApi } from '@/api/sensor-type'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import { MAP_TYPE_MAP, MAP_TYPE_PICTURE, STATUS_ACTIVE } from '@/constants'
import LatLngPicker from '@/components/Map/LatLngPicker.vue'
import LatLngImagePicker from '@/components/Map/LatLngImagePicker.vue'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})
const emits = defineEmits(['update:formModel', 'success'])

const appStore = useAppStore()
const isMobile = computed(() => appStore.isMobile)

const isEditing = computed(() => {
  return isFormEditing(props.formModel)
})
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [rule('required', true)],
    code: [rule('required', true)],
    wanIpAddress: [rule('required', true)],
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
  form.sensorMonitorPoints.push({ status: STATUS_ACTIVE })
  emits('update:formModel', form)
}
const removeSensorMonitorPoint = (index: number) => {
  const form = props.formModel
  form.sensorMonitorPoints.splice(index, 1)
  emits('update:formModel', form)
}
const updateFormModel = (node: any) => {
  emits('update:formModel', { ...props.formModel, ...node })
}
const setCoordinate = (coordinate: any) => {
  updateFormModel(coordinate)
}
const handleAreaIdClick = (area: any) => {
  const form = { ...props.formModel, ...{ area: area, areaId: area.id } }
  emits('update:formModel', form)
}
</script>

<style scoped>
.modal-split-layout {
  grid-template-columns: 682px 1fr;
  align-items: start;
}

.modal-left-col {
  padding-right: 10px;
  border-right: 1px solid var(--border);
}

.form-group-modal {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 10px;
}

.section-divider-v {
  width: 1px;
  background: var(--border);
  align-self: stretch;
}

.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.monitoring-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.points-table-modal {
  width: 100%;
  border-collapse: collapse;
}

.points-table-modal th {
  text-align: left;
  padding: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sub);
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
}

.points-table-modal td {
  padding: 8px;
}

.coord-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.btn-coord {
  background: #fbbf24;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
}

.coord-info {
  font-size: 12px;
  color: var(--text-sub);
  font-family: 'JetBrains Mono', monospace;
}

.btn-add-small {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.btn-add-small:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-delete-small {
  background: var(--danger);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.btn-delete-small:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  background: #dc2626;
}

.action-btn-delete {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.action-btn-delete:hover {
  background: var(--danger);
  color: white;
}

/* Coordinate Picker Modal */
.coord-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.95);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: 0.3s;
}

.coord-picker-overlay.open {
  visibility: visible;
  opacity: 1;
}

.picker-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.drawer-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
}
@media (max-width: 768px) {
  .points-table-modal {
    min-width: 0 !important;
  }
}
@media (max-width: 768px) {
  .points-table-modal tr {
    margin-bottom: 20px;
    background: transparent;
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
@media (max-width: 768px) {
  .points-table-modal tbody,
  .points-table-modal tr,
  .points-table-modal td {
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
}
@media (max-width: 768px) {
  .points-table-modal td {
    display: block !important;
    width: 62% !important;
    margin-left: 38% !important;
    text-align: left !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    font-size: 13px;
    color: white;
    position: relative;
    margin-bottom: 0 !important;
    height: auto;
    min-height: 36px;
  }
}

@media (max-width: 768px) {
  /* Label styling - Horizontal Layout (Left side) */
  .points-table-modal td::before {
    position: absolute;
    top: 50%;
    left: -58%;
    /* Position in the margin space relative to input width */
    width: 55%;
    transform: translateY(-50%);
    font-size: 13px;
    color: white;
    font-weight: normal !important;
    display: block;
    margin-bottom: 0;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Specific Labels */
  .points-table-modal td:nth-child(1)::before {
    content: 'Mã điểm đo';
  }

  .points-table-modal td:nth-child(2)::before {
    content: 'Tên điểm đo';
  }

  .points-table-modal td:nth-child(3)::before {
    content: 'Trạng thái';
  }

  .points-table-modal td:nth-child(4)::before {
    content: 'Hành động';
  }

  .points-table-modal td:nth-child(2)::before {
    content: 'Tên điểm đo';
  }

  .points-table-modal td:nth-child(3)::before {
    content: 'Trạng thái';
  }

  .points-table-modal td:nth-child(4)::before {
    content: 'Hành động';
  }

  /* Action column styling - remove input look */
  .points-table-modal td:last-child {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin-top: 5px !important;
    margin-bottom: 0 !important;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center;
    width: 100% !important;
    margin-left: 0 !important;
    min-height: 40px !important;
  }

  .points-table-modal td:last-child::before {
    display: none;
  }
}
</style>