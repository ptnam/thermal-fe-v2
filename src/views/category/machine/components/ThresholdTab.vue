<template>
  <el-tabs
      v-model="activeName"
      style="width: stretch"
  >
    <el-tab-pane
        v-for="(mode, indexMode) in thresholdList"
        :key="indexMode"
        :label="mode.name"
        :name="indexMode"
    >
      <div class="space-y-4">
        <el-form-item
            v-show="['Threshold'].includes(mode.code)"
            label="Ngưỡng nhiệt"
            label-position="top"
        >
          <input-number v-model="mode.threshold" :readonly="readonly"></input-number>
        </el-form-item>
        <AlertRange
            v-for="(level, indexLevel) in defaultLevels"
            :key="`${indexMode}_${indexLevel}`"
            v-model:toModel="mode.temperatureThresholds[indexLevel].maxTemperature"
            :fromModel="indexLevel === 0
                                      ? 0
                                      : mode.temperatureThresholds[indexLevel - 1].maxTemperature
                                  "
            :item="level"
            :readonly="readonly"
        />
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts">
import AlertRange from "@/views/category/machine/components/AlertRange.vue";
import InputNumber from "@/components/Input/InputNumber.vue";
import {ref} from "vue";
import {defaultLevels} from "@/views/category/machine/components/levels";

const activeName = ref(0)

defineProps({
  thresholdList: {
    type: Array<any>,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false
  },
})

</script>
<style scoped lang="scss">
.demo-tabs {
  .el-input {
    .el-input__wrapper {
      .el-input__inner {
        color: #000000 !important;
        -webkit-text-fill-color: #000000 !important;
      }
    }
  }

}

</style>