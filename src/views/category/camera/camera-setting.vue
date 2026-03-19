<template>
  <div class="container main-container" >
    <div class="camera-setting">

      <el-tabs v-model="activeName" type="border-card" @tabChange="tabChange">
        <el-tab-pane label="Quản lý tour" name="1">
          <setting-tour></setting-tour>
        </el-tab-pane>
        <el-tab-pane label="Quản lý góc quay" name="2">
          <setting-preset @addPreset="startDraw"></setting-preset>
        </el-tab-pane>
        <el-tab-pane label="Live" name="3">
            <stream-control
                ref="streamRef"
                :stream-key="cameraId"
                :show-btn-back="false"
                @pointedClicked="pointedClicked"
            >
              <template v-slot:sidebar>
                <div class="mt-4 flex flex-col">
                  <span class="text-sm">Điều khiển camera và chọn các điểm đo</span>
                  <div>
                    <el-tag
                      v-for="(item) in points"
                      :key="JSON.stringify(item)"
                      :type="item.success"
                      effect="dark"
                      class=""
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                  <div  class="mt-2">
                    <el-button :disabled="!points.length" type="primary" @click="savePreset">Lưu điểm đo</el-button>
                    <el-button type="danger" @click="clearPoints">Xóa điểm đo</el-button>
                  </div>
                </div>
              </template>
            </stream-control>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script setup lang="tsx">
import {ref } from 'vue'
import SettingTour from "@/views/category/camera/components/SettingTour.vue";
import SettingPreset from "@/views/category/camera/components/SettingPreset.vue";
import StreamControl from "@/components/Video/StreamControl.vue";
import {useRoute} from "vue-router";
const activeName = ref("1")

const route = useRoute()
const cameraId = route.params.id as string
const streamRef = ref();

const startDraw = () => {
  activeName.value = '3'
  setTimeout(() => {
    streamRef?.value?.startDrawing()
  }, 1000);
}

const tabChange = () => {
  if (activeName.value == '3') {
    setTimeout(() => {
      streamRef?.value?.startDrawing()
    }, 1000);
  }
}
const points = ref<any>([])
const pointedClicked = (point: any) => {
  points.value = point
}

const clearPoints = () => {
  streamRef?.value?.clearAllPoint()
}

const savePreset = () => {

}
</script>