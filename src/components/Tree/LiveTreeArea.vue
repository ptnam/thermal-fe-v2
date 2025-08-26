<template>
  <area-tree :request-fn="requestFn" v-bind="$attrs">
    <template #default="{ node }">
      <ElementTreeLine
          :node="node"
          :showLabelLine="true"
      >
        <template #node-label>
            <span>
              <el-icon v-if="isCam(node.data)" :color="CAMERA_TYPE_COLOR[node.data.cameraType]"
              ><VideoCamera/></el-icon>
              <el-icon v-else color="green"><MapLocation/></el-icon>
              {{ node.data.name }}
            </span>
        </template>
        <template v-if="isCam(node.data)" v-slot:after-node-label>
          <el-button
              @click="() => togglePinCam(node)"
              :icon="CollectionTag"
              size="small"
              circle
              :type="node.data.isPined ? 'warning': ''"
          ></el-button>
        </template>
      </ElementTreeLine>
    </template>
  </area-tree>
</template>

<script lang="ts" setup>
import {getElementLabelLine} from 'element-tree-line'
import 'element-tree-line/dist/style.css'
import {h} from 'vue'
import {CollectionTag, MapLocation, VideoCamera} from '@element-plus/icons-vue'
import {updateCameraSettingApi} from "@/api/camera-setting";
import {CAMERA_COMMANDS, CAMERA_TYPE_COLOR} from "@/constants";
import {isCam} from "@/utils/cameraUtils";
import AreaTree from "@/components/Tree/AreaTree.vue";

// Use component directly
const ElementTreeLine = getElementLabelLine(h)
defineProps<{
  requestFn: (data?: Record<string, any>) => Promise<any>
}>()
const emits = defineEmits(['updateCamSetting'])
const togglePinCam = (node: any) => {
  updateCameraSettingApi({
    flagCommand: node.data.isPined ? CAMERA_COMMANDS.REMOVE : CAMERA_COMMANDS.ADD,
    cameraIds: [node.data.id]
  }).then((res) => {
    node.data.isPined = !node.data.isPined
    emits("updateCamSetting", res.data)
  })
}
</script>
