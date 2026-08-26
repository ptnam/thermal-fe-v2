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
    <el-tabs
        v-model="tabModel"
        type="card"
    >
      <el-tab-pane
        v-if="machinePartThresholdList"
        name="gen"
        label="Khai báo chung từ loại thiết bị"
      >
        <threshold-tab :threshold-list="machinePartThresholdList"/>
      </el-tab-pane>
      <el-tab-pane
          name="main"
          label="Khai báo riêng"
      >
        <div class="p-4 ml-2 min-h-[400px]">
          <el-form-item
              label="Loại ngưỡng cảnh báo"
              label-position="top"
          >
            <ThresholdFilter
              v-model="thresholdListModel"
              :options="options"
              @change="changeThresholdTypeList"
            />
          </el-form-item>
          <threshold-tab :threshold-list="thresholdList"/>
        </div>
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
import {ref} from 'vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import {cloneObject} from "@/utils/objectUtils";
import {defaultLevels} from "@/views/category/machine/components/levels";
import ThresholdTab from "@/views/category/machine/components/ThresholdTab.vue";
import ThresholdFilter from '@/views/category/machine-part/components/ThresholdFilter.vue'
import { useConfigStore } from '@/store/modules/configStore'

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
  }
})

const tabModel = ref(props.tab)

const configStore = useConfigStore();
const options = ref(configStore.getConfig('thresholdTypeList') ?? [])

// Emits
const emits = defineEmits(['save', 'cancel', 'update:thresholdList'])

// Ensure temperatureThresholds is initialized for each mode
const thresholdListModel = ref<any[]>([])

const dialogOpen = () => {
  thresholdListModel.value = props.thresholdList
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
</script>
