<template>
  <el-button
      type="info"
      :icon="Back"
      @click="goBack"
      v-bind="$attrs"
  >
    Quay lại
  </el-button>
</template>

<script lang="ts" setup>
import { Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

// Props
const props = defineProps<{
  defaultPath?: string
}>()

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else if (props.defaultPath) {
    router.push(props.defaultPath)
  } else {
    console.warn('No history and no defaultPath provided.')
  }
}
</script>
