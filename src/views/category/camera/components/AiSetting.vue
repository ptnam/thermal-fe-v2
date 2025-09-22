<template>
  <div>
    <el-checkbox
      v-for="item in options"
      :key="item.code"
      :label="item.code"
      :disabled="item.disabled"
      v-model="item.isSelected"
    >
      {{ item.name }}
    </el-checkbox>
    <div class="text-center mt-8">
      <save-button @click="saveForm" :loading="isLoading"></save-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SaveButton from '@/components/Button/SaveButton.vue'
import { getAiServicesApi, saveAiServicesApi } from '@/api/camera'
import useRequest from '@/hooks/web/useRequest'
import { ElMessage } from 'element-plus'

interface Option {
  code: string
  name: string
  isSelected: boolean
  disabled?: boolean
}

const props = defineProps<{
  camera: { id: number }
}>()

const options = ref<Option[]>([])

onMounted(() => {
  if (props.camera?.id) {
    getAiServicesApi({ cameraId: props.camera.id }).then((res) => {
      options.value = res.data
    })
  }
})
const emits = defineEmits(['saved'])
const { onRequest, isLoading } = useRequest()
const saveForm = () => {
  onRequest(saveAiServicesApi, {
    cameraId: props.camera.id,
    aiServices: options.value,
  }).then(() => {
    ElMessage({
      message: 'Lưu thành công!',
      type: 'success',
    })
    emits('saved')
  })
}
</script>
