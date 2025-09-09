<template>
  <el-form
    ref="refForm"
    label-position="left"
    :model="formModelValue"
    :validate-on-rule-change="false"
    label-width="auto"
    style="min-width: 600px"
  >
    <el-form-item label="Thời gian">
      <view-input :contain="formModelValue?.formattedDate" :disabled="true" />
    </el-form-item>
    <el-form-item label="Khu vực">
      <view-input :contain="formModelValue?.areaName" :disabled="true" />
    </el-form-item>
    <el-form-item label="Tên camera">
      <view-input :contain="formModelValue?.cameraName" :disabled="true" />
    </el-form-item>
    <el-form-item label="Loại cảnh báo">
      <view-input :contain="formModelValue?.warningEventName" :disabled="true" />
    </el-form-item>
    <el-form-item label="Hình ảnh">
      <el-image
        :src="formModelValue.imagePath"
        :lazy="true"
        fit="cover"
        :preview-src-list="[formModelValue.imagePath]"
        :show-progress="true"
        :preview-teleported="true"
      />
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { ElImage } from 'element-plus'
import ViewInput from '@/components/Input/ViewInput.vue'
import { ref, watch } from 'vue'

const formModelValue = ref<any>({
  id: null,
  compareResultObject: {},
  compareTypeObject: {},
  statusObject: {},
})

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})
watch(
  () => props.formModel,
  (newVal) => {
    formModelValue.value = newVal
  },
  { immediate: true },
)
</script>