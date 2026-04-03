<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="Thông số camera" name="first">
      <camera-form
        v-model:formModel="formModel"
        :is-editing="isEditing"
        @success="saveSuccess"
      ></camera-form>
    </el-tab-pane>
    <el-tab-pane v-if="isEditing" label="Điều khiển cam" name="second">
      <set-viewing-angle
        :form-model="formModel"
        :isEditing="isEditing"
        class="mt-4"
      ></set-viewing-angle>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {isFormEditing} from '@/utils/is'
import SetViewingAngle from '@/views/category/camera/components/SetViewingAngle.vue'
import CameraForm from '@/views/category/camera/components/CameraForm.vue'

const formModel = defineModel<any>('formModel')

const activeName = ref('first')
const emits = defineEmits(['success'])
const isEditing = computed(() => {
  return isFormEditing(formModel.value)
})

const saveSuccess = () => {
  emits('success')
}
</script>
