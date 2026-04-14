<template>
  <el-upload class="mb-5" :show-file-list="false" :before-upload="handlePreview" accept="image/*">
    <el-button type="primary">Tải lên hỉnh ảnh</el-button>
  </el-upload>

  <div v-if="previewData" class="relative inline-block m-4">
    <img :src="previewData" alt="Preview" class="w-full max-w-[300px] rounded border border-gray-300"/>
    <el-button
        class="!absolute !top-1 !right-1 !p-1"
        @click="removeImage"
        type="info"
        :icon="Close"
        circle
    />
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {Close} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue', 'onfile'])

const previewData = ref(props.modelValue || null)

watch(
    () => props.modelValue,
    (val) => {
      previewData.value = val
    },
)

const handlePreview = (file) => {

  const reader = new FileReader()
  reader.onload = () => {
    previewData.value = reader.result
  }
  reader.readAsDataURL(file)
  emit("onfile", file)
}

const removeImage = () => {
  previewData.value = null
  emit("onfile", null)
}
</script>
