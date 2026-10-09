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
        <el-button class="h-[32px] w-[120px]" type="primary">{{ t('upload.chooseFile') }}</el-button>
      </template>
    </el-upload>
    <div class="text-center">
      <el-button
        type="success"
        class="mt-4 h-[32px] w-[120px]"
        :loading="loading"
        @click="handleUpload"
      >
        Upload
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLang } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useLang()

interface Props {
  title?: string
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
    ElMessage.warning(t('upload.pleaseChooseFile'))
    return
  }

  try {
    loading.value = true
    const res = await props.api(file.value)

    ElMessage.success(t('upload.success'))
    emit('success', res)
  } catch (err) {
    ElMessage.error(t('upload.failed'))
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