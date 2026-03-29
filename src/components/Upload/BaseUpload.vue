<template>
  <div class="upload-wrapper">
    <div class="mb-2 font-semibold">{{ title }}</div>

    <el-upload
        class="text-center"
        :auto-upload="false"
        :show-file-list="true"
        :on-change="handleChange"
        :limit="1"
    >
      <template #trigger>
        <el-button type="primary">Chọn file</el-button>
      </template>

      <el-button
          type="success"
          class="ml-2"
          :loading="loading"
          @click="handleUpload"
      >
        Upload
      </el-button>
    </el-upload>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  title: string
  api: (file: File) => Promise<any>
}

const props = defineProps<Props>()
const emit = defineEmits(['success', 'error'])

const file = ref<File | null>(null)
const loading = ref(false)

const handleChange = (uploadFile: any) => {
  file.value = uploadFile.raw
}

const handleUpload = async () => {
  if (!file.value) {
    ElMessage.warning('Vui lòng chọn file')
    return
  }

  try {
    loading.value = true
    const res = await props.api(file.value)

    ElMessage.success('Upload thành công')
    emit('success', res)
  } catch (err) {
    ElMessage.error('Upload thất bại')
    emit('error', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upload-wrapper {
  display: flex;
  flex-direction: column;
}
</style>