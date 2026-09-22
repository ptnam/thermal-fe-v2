<template>
  <div class="drawer">
    <div class="md:mt-8" >
      <el-tabs v-model="activeName" >
        <el-tab-pane label="Thông số camera" name="first">
          <camera-form
            v-model:formModel="formModel"
            :is-editing="isEditing"
            @success="saveSuccess"
            classDrawer="flex fixed flex-col h-[90%]"
          ></camera-form>
        </el-tab-pane>
        <el-tab-pane v-if="isEditing && !isPdCamera" label="Điều khiển cam" name="second">
          <set-viewing-angle
            :form-model="formModel"
            :isEditing="isEditing"
            class="mt-4"
          ></set-viewing-angle>
        </el-tab-pane>
        <el-tab-pane v-if="isEditing && isPdCamera" label="Cấu hình giám sát phóng điện" name="fifth">
          <camera-batcam-config-panel :form-model="formModel"></camera-batcam-config-panel>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {isFormEditing} from '@/utils/is'
import SetViewingAngle from '@/views/category/camera/components/SetViewingAngle.vue'
import CameraForm from '@/views/category/camera/components/CameraForm.vue'
import CameraBatcamConfigPanel from '@/views/category/camera/components/CameraBatcamConfigPanel.vue'
import { CAMERA_PD_TYPE } from '@/constants'

const formModel = defineModel<any>('formModel')

const activeName = ref('first')
const emits = defineEmits(['success'])
const isEditing = computed(() => {
  return isFormEditing(formModel.value)
})
// Ẩn/hiện tab theo chức năng camera (không theo hãng): chỉ camera giám sát phóng điện mới có tab PD.
const isPdCamera = computed(() => formModel.value?.cameraType === CAMERA_PD_TYPE)

const saveSuccess = () => {
  emits('success')
}
</script>
<style scoped>


</style>