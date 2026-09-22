<template>
  <el-drawer
      :lock-scroll="false"
      :destroy-on-close="true"
      :append-to-body="true"
      @open="dialogOpen"
      :show-close="false"
      v-bind="$attrs">
    <template #header>
      <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          </svg>
          <h3 class="text-[14px] md:text-[18px] text-[#3b82f6] uppercase">THIẾT LẬP NGƯỠNG CẢNH BÁO</h3>
        </div>
      </div>
    </template>
    <!-- Tách 2 tab domain Nhiệt độ / Phóng điện (PD) - đây là nơi cấu hình "Khai báo chung từ loại thiết
         bị" hiện ra ở MachinePointDialog.vue (Khai báo riêng theo bộ phận). -->
    <el-tabs v-model="domainTab" type="card">
      <el-tab-pane name="thermal" label="Ngưỡng nhiệt độ">
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
      <el-tab-pane name="pd" label="Ngưỡng phóng điện (PD)">
        <div class="p-4 ml-2 min-h-[400px]">
          <!-- Single-select - PD chỉ chọn 1 trong 2 kiểu (ΔPD%/tháng HOẶC ngưỡng dB tuyệt đối). -->
          <el-form-item label="Loại ngưỡng PD nhận cảnh báo" label-position="top">
            <el-select v-model="pdSelectedType" value-key="id" clearable class="!w-full">
              <el-option v-for="item in pdThresholdTypeOptions" :key="item.id" :label="item.name" :value="item"/>
            </el-select>
          </el-form-item>

          <!-- Công thức ΔPD%/tháng MẶC ĐỊNH cho mọi bộ phận thuộc loại này (bộ phận nào có công thức riêng
               thì công thức riêng ưu tiên hơn - xem MachinePointDialog.vue). -->
          <PdFormulaAssignmentPicker v-if="pdSelectedType?.id === PD_GROWTH_RATE_ID" :target-type="2" :target-id="props.partId"/>

          <threshold-tab :threshold-list="pdThresholdList"/>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="flex justify-between md:justify-start space-x-2">
        <cancel-button @click="emits('cancel')"></cancel-button>
        <el-button
            type="primary"
            @click="emits('save', thresholdList)"
        >Lưu cấu hình</el-button>
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
import {useConfigStore} from "@/store/modules/configStore";
import ThresholdFilter from "@/views/category/machine-part/components/ThresholdFilter.vue";
import PdFormulaAssignmentPicker from '@/views/category/machine/components/PdFormulaAssignmentPicker.vue'

// ThresholdType.PdGrowthRate (7) / PdLevelDb (8) - xem Enums.cs (BE).
const PD_THRESHOLD_TYPE_IDS = [7, 8]
const PD_LEVEL_DB_ID = 8
const PD_GROWTH_RATE_ID = 7
const configStore = useConfigStore();
const allThresholdTypeOptions = computed(() => configStore.getConfig('thresholdTypeList') ?? [])
const thermalThresholdTypeOptions = computed(() =>
    allThresholdTypeOptions.value.filter((item: any) => !PD_THRESHOLD_TYPE_IDS.includes(item.id)),
)
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
const domainTab = ref<'thermal' | 'pd'>('thermal')

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
  // Id loại bộ phận đang sửa - undefined khi đang thêm mới (chưa lưu) - xem PdFormulaAssignmentPicker.vue.
  partId: {
    type: Number,
    required: false,
  },
})

// Emits
const emits = defineEmits(['save', 'cancel', 'update:thresholdList'])

const thresholdListModel = ref<any[]>([])

const dialogOpen = () => {
  thresholdListModel.value = props.thresholdList
  domainTab.value = 'thermal'
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

const thermalSelectedTypes = computed<any[]>({
  get: () => thresholdListModel.value.filter((t: any) => !PD_THRESHOLD_TYPE_IDS.includes(t.id)),
  set: (val: any[]) => {
    thresholdListModel.value = [...val, ...thresholdListModel.value.filter((t: any) => PD_THRESHOLD_TYPE_IDS.includes(t.id))]
  },
})
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
</script>
<style scoped>
.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
