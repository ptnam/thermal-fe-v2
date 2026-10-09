<template>
  <el-form
    ref="refForm"
    label-position="left"
    :model="formModelValue"
    :validate-on-rule-change="false"
    label-width="auto"
    style="min-width: 600px"
  >
    <el-form-item :label="t('alert.time')">
      <view-input :contain="formModelValue?.formattedDate" :disabled="true" />
    </el-form-item>
    <el-form-item :label="t('fields.area')">
      <view-input :contain="formModelValue?.areaName" :disabled="true" />
    </el-form-item>
    <el-form-item :label="t('camera.name')">
      <view-input :contain="formModelValue?.cameraName" :disabled="true" />
    </el-form-item>
    <el-form-item :label="t('alert.alertType')">
      <view-input :contain="formModelValue?.warningEventName" :disabled="true" />
    </el-form-item>
    <el-form-item :label="t('alert.image')">
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
import { useLang } from '@/hooks/web/useI18n'
import { ElImage } from 'element-plus'
import ViewInput from '@/components/Input/ViewInput.vue'
import { ref, watch } from 'vue'

const { t } = useLang()

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