<template>
  <el-dialog
      :lock-scroll="false"
      :destroy-on-close="true"
      :append-to-body="true"
      @open="dialogOpen"
      :center="true"
      align-center
      style="min-width: 800px"
      v-bind="$attrs">
    <div class="p-4 border border-dashed border-gray-300 ml-2 min-h-[400px]">
      <el-form-item
        label="Loại ngưỡng cảnh báo"
        label-position="top"
      >
        <object-select-from-config
          :teleported="false"
          key-config="thresholdTypeList"
          v-model="thresholdListModel"
          :multiple="true"
          @change="changeThresholdTypeList"
        />
      </el-form-item>
      <threshold-tab :threshold-list="thresholdList"/>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <cancel-button @click="emits('cancel')"></cancel-button>
        <save-button @click="emits('save', thresholdList)"></save-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import SaveButton from '@/components/Button/SaveButton.vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import ObjectSelectFromConfig from "@/components/Selection/ObjectSelectFromConfig.vue"
import {cloneObject} from "@/utils/objectUtils";
import {defaultLevels} from "@/views/category/machine/components/levels";
import ThresholdTab from "@/views/category/machine/components/ThresholdTab.vue";

// Props
const props = defineProps({
  thresholdList: {
    type: Array<any>,
    required: true,
  },
  machinePartThresholdList: {
    type: Array<any>,
    required: false,
  }
})

// Emits
const emits = defineEmits(['save', 'cancel', 'update:thresholdList'])

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
