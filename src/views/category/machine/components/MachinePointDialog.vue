<template>
  <el-drawer
      :lock-scroll="false"
      :destroy-on-close="true"
      :append-to-body="true"
      @open="dialogOpen"
      :center="true"
      align-center
      :show-close="false"
      v-bind="$attrs">
    <!-- Tách 2 tab domain Nhiệt độ / Phóng điện (PD) - 2 nghiệp vụ khác hẳn nhau (đơn vị, cách so sánh,
         công thức riêng cho PD), gộp chung 1 danh sách trước đây dễ chọn nhầm. -->
    <el-tabs v-model="domainTab" type="card">
      <el-tab-pane name="thermal" label="Ngưỡng nhiệt độ">
        <el-tabs v-model="thermalTabModel" type="card">
          <el-tab-pane
              v-if="props.machinePartThresholdList"
              name="gen"
              label="Khai báo chung từ loại thiết bị"
          >
            <threshold-tab :threshold-list="thermalMachinePartThresholdList"/>
          </el-tab-pane>
          <el-tab-pane name="main" label="Khai báo riêng">
            <div class="p-4 ml-2 min-h-[400px]">
              <el-form-item label="Loại ngưỡng cảnh báo" label-position="top">
                <ThresholdFilter
                    v-model="thermalSelectedTypes"
                    :options="thermalThresholdTypeOptions"
                    @change="changeThresholdTypeList"
                />
              </el-form-item>
              <threshold-tab :threshold-list="thermalThresholdList"/>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
      <el-tab-pane name="pd" label="Ngưỡng phóng điện (PD)">
        <el-tabs v-model="pdTabModel" type="card">
          <el-tab-pane
              v-if="props.machinePartThresholdList"
              name="gen"
              label="Khai báo chung từ loại thiết bị"
          >
            <threshold-tab :threshold-list="pdMachinePartThresholdList"/>
          </el-tab-pane>
          <el-tab-pane name="main" label="Khai báo riêng">
            <div class="p-4 ml-2 min-h-[400px]">
              <!-- Single-select - PD chỉ chọn 1 trong 2 kiểu (ΔPD%/tháng HOẶC ngưỡng dB tuyệt đối). -->
              <el-form-item label="Loại ngưỡng PD nhận cảnh báo" label-position="top">
                <el-select v-model="pdSelectedType" value-key="id" clearable class="!w-full">
                  <el-option v-for="item in pdThresholdTypeOptions" :key="item.id" :label="item.name" :value="item"/>
                </el-select>
              </el-form-item>

              <!-- Công thức ΔPD%/tháng RIÊNG của bộ phận - chưa gán gì = dùng công thức theo loại bộ phận,
                   hoặc mặc định cố định nếu loại bộ phận cũng chưa cấu hình. -->
              <PdFormulaAssignmentPicker v-if="pdSelectedType?.id === PD_GROWTH_RATE_ID" :target-type="1" :target-id="props.componentId"/>

              <threshold-tab :threshold-list="pdThresholdList"/>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="flex justify-between space-x-2">
        <cancel-button @click="emits('cancel')"></cancel-button>
        <el-button type="primary" @click="emits('save', thresholdList)">Lưu cấu hình</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import {cloneObject} from "@/utils/objectUtils";
import {defaultLevels} from "@/views/category/machine/components/levels";
import ThresholdTab from "@/views/category/machine/components/ThresholdTab.vue";
import ThresholdFilter from '@/views/category/machine-part/components/ThresholdFilter.vue'
import PdFormulaAssignmentPicker from '@/views/category/machine/components/PdFormulaAssignmentPicker.vue'
import { useConfigStore } from '@/store/modules/configStore'

// ThresholdType.PdGrowthRate (7) / PdLevelDb (8) - xem Enums.cs (BE).
const PD_THRESHOLD_TYPE_IDS = [7, 8]
const PD_LEVEL_DB_ID = 8
const PD_GROWTH_RATE_ID = 7
const configStore = useConfigStore()
const allThresholdTypeOptions = computed(() => configStore.getConfig('thresholdTypeList') ?? [])
const thermalThresholdTypeOptions = computed(() =>
    allThresholdTypeOptions.value.filter((item: any) => !PD_THRESHOLD_TYPE_IDS.includes(item.id)),
)
// Tên hiển thị riêng cho 2 option PD - làm rõ đơn vị/cách so sánh ngay trong tên, tránh nhầm giữa 2 kiểu.
const PD_THRESHOLD_TYPE_LABELS: Record<number, string> = {
  [PD_GROWTH_RATE_ID]: 'So với tốc độ tăng ΔPD% theo kỳ',
  [PD_LEVEL_DB_ID]: 'So với ngưỡng cường độ PD (dB)',
}
const pdThresholdTypeOptions = computed(() =>
    allThresholdTypeOptions.value
        .filter((item: any) => PD_THRESHOLD_TYPE_IDS.includes(item.id))
        .map((item: any) => ({ ...item, name: PD_THRESHOLD_TYPE_LABELS[item.id] ?? item.name }))
        .sort((a: any, b: any) => (a.id === PD_LEVEL_DB_ID ? -1 : b.id === PD_LEVEL_DB_ID ? 1 : 0)),
)

// Props
const props = defineProps({
  thresholdList: {
    type: Array<any>,
    required: true,
  },
  machinePartThresholdList: {
    type: Array<any>,
    required: false,
  },
  tab: {
    type: String,
    default: 'gen'
  },
  // Id bộ phận đang sửa - undefined khi đang thêm mới (chưa lưu) - PdFormulaAssignmentPicker cần id thật
  // để gán/xem lịch sử công thức.
  componentId: {
    type: Number,
    required: false,
  },
})

const domainTab = ref<'thermal' | 'pd'>('thermal')
const thermalTabModel = ref(props.tab)
const pdTabModel = ref(props.tab)

// Emits
const emits = defineEmits(['save', 'cancel', 'update:thresholdList'])

// Ensure temperatureThresholds is initialized for each mode
const thresholdListModel = ref<any[]>([])

const dialogOpen = () => {
  thresholdListModel.value = props.thresholdList
  domainTab.value = 'thermal'
  thermalTabModel.value = props.tab
  pdTabModel.value = props.tab
}
const changeThresholdTypeList = () => {
  const listModeTmp: any[] = [];
  thresholdListModel.value.forEach((mode: any) => {
    const modeTmp = cloneObject(mode)
    const oldMode = props.thresholdList ?
        props.thresholdList.find(item => item.id === modeTmp.id) :
        false;
    if (!oldMode) {
      modeTmp.temperatureThresholds = defaultLevels.map((levelItem) => ({
        maxTemperature: 0,
        thresholdType: mode.id,
        level: levelItem.level
      }))
      listModeTmp.push(modeTmp)
    } else {
      listModeTmp.push(oldMode)
    }
  })
  emits("update:thresholdList", listModeTmp)
}

// Danh sách LOẠI đang chọn tách theo domain để 2 selector độc lập - sửa bên nào chỉ ghi đè đúng phần của
// domain đó trong thresholdListModel gộp chung, giữ nguyên phần domain còn lại.
const thermalSelectedTypes = computed<any[]>({
  get: () => thresholdListModel.value.filter((t: any) => !PD_THRESHOLD_TYPE_IDS.includes(t.id)),
  set: (val: any[]) => {
    thresholdListModel.value = [...val, ...thresholdListModel.value.filter((t: any) => PD_THRESHOLD_TYPE_IDS.includes(t.id))]
  },
})
// PD chỉ được chọn 1 trong 2 kiểu (ΔPD%/tháng HOẶC ngưỡng dB tuyệt đối, không dùng song song).
const pdSelectedType = computed<any | null>({
  get: () => thresholdListModel.value.find((t: any) => PD_THRESHOLD_TYPE_IDS.includes(t.id)) ?? null,
  set: (val: any | null) => {
    const thermalPart = thresholdListModel.value.filter((t: any) => !PD_THRESHOLD_TYPE_IDS.includes(t.id))
    thresholdListModel.value = val ? [...thermalPart, val] : thermalPart
    changeThresholdTypeList()
  },
})

const thermalThresholdList = computed(() => (props.thresholdList ?? []).filter((t: any) => !PD_THRESHOLD_TYPE_IDS.includes(t.id)))
const pdThresholdList = computed(() => (props.thresholdList ?? []).filter((t: any) => PD_THRESHOLD_TYPE_IDS.includes(t.id)))
const thermalMachinePartThresholdList = computed(() => (props.machinePartThresholdList ?? []).filter((t: any) => !PD_THRESHOLD_TYPE_IDS.includes(t.id)))
const pdMachinePartThresholdList = computed(() => (props.machinePartThresholdList ?? []).filter((t: any) => PD_THRESHOLD_TYPE_IDS.includes(t.id)))
</script>
