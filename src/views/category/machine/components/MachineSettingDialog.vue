<template>
  <el-dialog
      style="min-width: 800px"
      @open="loadForm"
      :close-on-click-modal="false"
      :center="true"
      align-center
      @close="() => (modelComponents = [])"
      :append-to-body="true"
      v-bind="$attrs"
  >
    <div class="min-h-[300px]">
      <el-tabs
          v-model="editableTabsValue"
          type="card"
          class="demo-tabs"
          closable
          @tab-remove="removeTab"
          @tab-change="() => saveForm()"
      >
        <el-tab-pane
            v-for="(item, index) in modelComponents"
            :key="index"
            :label="item.name"
            :name="index"
        >
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="Tên" label-width="100px">
                <el-input v-model="item.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                  v-if="formModel?.area && formModel.areaId"
                  label-width="60px"
                  label="Tọa độ"
              >
                <LatLngPicker
                    v-if="formModel?.area?.mapType === MAP_TYPE_MAP"
                    :map-config="item"
                    @input="(coordinate) => setCoordinate(index, coordinate)"
                />
                <lat-lng-image-picker
                    v-if="formModel?.area?.mapType === MAP_TYPE_PICTURE"
                    :image-path="formModel?.area?.photoPath"
                    :map-config="item"
                    @input="(coordinate) => setCoordinate(index, coordinate)"
                />
                <p v-if="item.longitude && item.latitude" class="m-0 whitespace-nowrap">
                  <span class="font-bold">Kinh độ:</span> {{ item.longitude }},
                  <span class="font-bold">Vĩ độ:</span> {{ item.latitude }}
                </p>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item
                  label="Bộ phận cha"
                  label-position="left"
                  label-width="100px"
              >

                <select-options
                    v-model="item.parentName"
                    :options="formModel?.dictMachineParts?.[machinePart.parentId]?.machineComponents"
                    value-key="name"
                    col-value="name"
                    col-label="name"
                    placeholder="Chọn bộ phận cha"
                    filterable
                >
                </select-options>
              </el-form-item>
            </el-col>
            <el-col :span="12"></el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="Camera" label-width="100px">
                <virtualized-select-from-url
                    ref="cameraRef"
                    v-model="item.cameraId"
                    :request-fn="() => getAllCamerasApi({ areaId: formModel.areaId })"
                    filterable
                    value-key="id"
                    @change="() => changeCamera(index)"
                    clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Sensor" label-width="60px">
                <virtualized-select-from-url
                    ref="sensorRef"
                    v-model="item.sensorId"
                    :request-fn="() => getAllSensorsApi({ areaId: formModel.areaId })"
                    filterable
                    value-key="id"
                    @change="() => changeSensor(index)"
                    clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item
              v-if="item.cameraId"
              label="Điểm giám sát của camera được chọn"
              label-position="top"
              label-width="120px"
          >
            <ObjectSelectPoints
                :ref="(el) => (monitorPointCameraRefs[index] = el)"
                v-model="item.machineMonitorCameraPoints"
                :formModel="formModel"
                fieldPoint="machineMonitorCameraPoints"
                :exceptPoints="item.machineMonitorCameraPoints"
                :request-fn="() => getAllMonitorPointByCamApi(item.cameraId)"
                multiple
                value-key="monitorPointId"
                col-value="monitorPointId"
                col-label="name"
                placeholder="Chọn điểm giám sát"
                filterable
            >
            </ObjectSelectPoints>
          </el-form-item>
          <el-form-item
              v-if="item.sensorId"
              label-position="top"
              label="Điểm giám sát của Sensor được chọn"
              label-width="120px"
          >
            <ObjectSelectPoints
                :ref="(el) => (monitorPointSensorRefs[index] = el)"
                v-model="item.machineMonitorSensorPoints"
                :formModel="formModel"
                fieldPoint="machineMonitorSensorPoints"
                :exceptPoints="item.machineMonitorSensorPoints"
                :request-fn="() => getAllMonitorPointBySensorApi(item.sensorId)"
                multiple
                value-key="monitorPointId"
                col-value="monitorPointId"
                col-label="name"
                placeholder="Chọn điểm giám sát"
                filterable
            >
            </ObjectSelectPoints>
          </el-form-item>
          <div v-show="item?.machineMonitorCameraPoints?.length">
            <p class="font-bold">Danh sách điểm giám sát của camera</p>
            <div class="flex gap-2 mt-2">
              <machine-point-button
                  v-for="(point, pointIndex) in item?.machineMonitorCameraPoints ?? []"
                  :key="pointIndex"
                  :point="point"
                  class="mb-4"
                  @remove="
                  () => removeSettingMonitor(index, pointIndex, 'machineMonitorCameraPoints')
                "
              >
              </machine-point-button>
            </div>
          </div>
          <div v-show="item?.machineMonitorSensorPoints?.length">
            <p class="font-bold">Danh sách điểm giám sát của cảm biến</p>
            <div class="flex gap-2 mt-2">
              <machine-point-button
                  v-for="(point, pointIndex) in item.machineMonitorSensorPoints ?? []"
                  :key="pointIndex"
                  :point="point"
                  class="mb-4"
                  @remove="
                  () => removeSettingMonitor(index, pointIndex, 'machineMonitorSensorPoints')
                "
              >
              </machine-point-button>
            </div>
          </div>
          <el-form-item
              v-show="item?.machineComponentThresholdList?.length"
              label="Ngưỡng nhiệt"
              prop="machinePartThresholdList"
              label-width="120px"
          >
            <div class="flex flex-wrap gap-1">
              <el-tag
                  v-for="(thresholdItem, index) in item?.machineComponentThresholdList ?? []"
                  :key="index"
                  :effect="thresholdItem?.temperatureThresholds?.length ? 'dark' : 'plain'"
                  :type="thresholdItem?.temperatureThresholds?.length ? 'success' : 'danger'"
              >
                {{ thresholdItem.name }}
              </el-tag>
            </div>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="add" ref="add" :disabled="true">
          <template v-slot:label>
            <el-button
                slot="reference"
                :icon="Plus"
                style="margin: 0 1% 0 1%"
                @click.stop="addTab()"
            />
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <div class="flex justify-center space-x-2">
        <cancel-button @click="emits('cancel')"></cancel-button>
        <el-button v-show="modelComponents.length" type="warning"
                   @click="() => openTemperatureThreshold(editableTabsValue)">
          Thiết lập ngưỡng nhiệt
        </el-button>
        <save-button @click="() => saveForm(true)"></save-button>
      </div>
    </template>
  </el-dialog>

  <MachinePointDialog
      v-model="dialogMachinePointVisible"
      v-model:threshold-list="machineMonitorPoint"
      v-model:machinePartThresholdList="machinePartThresholdList"
      @save="saveMachinePoint"
      @cancel="dialogMachinePointVisible = false"
      :append-to-body="true"
      align-center
      class="h-fit"
      style="max-width: 600px"
  ></MachinePointDialog>
</template>

<script setup lang="ts">
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import {getAllCamerasApi} from '@/api/camera'
import {nextTick, ref} from 'vue'
import {getAllSensorsApi} from '@/api/sensor'
import {getAllMonitorPointByCamApi, getAllMonitorPointBySensorApi} from '@/api/monitor-point'
import MachinePointButton from '@/views/category/machine/components/MachinePointButton.vue'
import {cloneObject} from '@/utils/objectUtils'
import SaveButton from '@/components/Button/SaveButton.vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import {TabPaneName} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import MachinePointDialog from '@/views/category/machine/components/MachinePointDialog.vue'
import {MAP_TYPE_MAP, MAP_TYPE_PICTURE} from '@/constants'
import LatLngPicker from '@/components/Map/LatLngPicker.vue'
import LatLngImagePicker from '@/components/Map/LatLngImagePicker.vue'
import SelectOptions from "@/components/Selection/SelectOptions.vue";
import ObjectSelectPoints from "@/views/category/machine/components/ObjectSelectPoints.vue";

const emits = defineEmits(['cancel', 'save'])
const editableTabsValue = ref(0)
const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
  machinePartId: {
    type: [String, Number],
    required: true,
  },
  machinePart: {
    type: Object,
    required: true,
  },
})

const machineComponent = ref({
  cameraId: null,
  sensorId: null,
  name: '',
  machineMonitorSensorPoints: [],
  machineMonitorCameraPoints: [],
})
const modelComponents = ref<any[]>([])
const machineComponentDefault = JSON.parse(JSON.stringify(machineComponent.value))

const monitorPointCameraRefs = ref<any[]>([])
const monitorPointSensorRefs = ref<any[]>([])

const loadForm = () => {
  const components = cloneObject(
      props.formModel?.dictMachineParts?.[props.machinePartId]?.machineComponents,
      [],
  ) ?? [getDefaultMachineComponent()]
  components.map(function (componentItem: any) {
    componentItem.parentName = getParentName(componentItem)
  })

  modelComponents.value = components
  editableTabsValue.value = 0
}

const getParentName = (componentItem: any) => {
  if (componentItem.parentName) {
    return componentItem.parentName;
  }
  if (!componentItem.parentName &&
      props.formModel?.dictMachineParts?.[props.machinePart.parentId]?.machineComponents.length) {
    return props.formModel?.dictMachineParts?.[props.machinePart.parentId]?.machineComponents[0].name
  }
  return null;
}

const getDefaultMachineComponent = () => {
  const tmp = cloneObject(machineComponentDefault)
  tmp.name = props.machinePart?.name + ' ' + (modelComponents.value.length + 1)
  tmp.parentName = getParentName(tmp)
  tmp.machinePartThresholdList = props.machinePart.machinePartThresholdList
  return tmp
}

const addTab = () => {
  modelComponents.value.push(getDefaultMachineComponent())
  editableTabsValue.value = modelComponents.value.length - 1
  saveForm()
}
const removeTab = (targetName: TabPaneName) => {
  modelComponents.value.splice(targetName as number, 1)
  editableTabsValue.value = modelComponents.value.length - 1
  saveForm()
}

const saveForm = (closeSetting = false) => {
  emits('save', modelComponents.value, closeSetting)
}
const changeCamera = (index: number) => {
  nextTick(() => {
    monitorPointCameraRefs?.value?.[index]?.fetch()
  })
}
const changeSensor = (index: number) => {
  nextTick(() => {
    monitorPointSensorRefs?.value?.[index]?.fetch()
  })
}

const removeSettingMonitor = (componentIndex: number, pointIndex: number, field: string) => {
  modelComponents.value[componentIndex][field].splice(pointIndex, 1)
}
const dialogMachinePointVisible = ref(false)
const componentIndexValue = ref<number>(0)
const machineMonitorPoint = ref<any[]>([])
const machinePartThresholdList = ref<any[]>([])
const openTemperatureThreshold = (componentIndex: number) => {
  componentIndexValue.value = componentIndex
  machineMonitorPoint.value = cloneObject(
      modelComponents.value[componentIndex]?.machineComponentThresholdList ?? [],
  )
  machinePartThresholdList.value = cloneObject(
      modelComponents.value[componentIndex]?.machinePartThresholdList ?? [],
  )
  dialogMachinePointVisible.value = true
}
const saveMachinePoint = (data: any) => {
  modelComponents.value[componentIndexValue.value].machineComponentThresholdList = data
  dialogMachinePointVisible.value = false
}

const setCoordinate = (componentIndex: number, coordinate: any) => {
  modelComponents.value[componentIndex] = {
    ...modelComponents.value[componentIndex],
    ...coordinate,
  }
}
</script>
