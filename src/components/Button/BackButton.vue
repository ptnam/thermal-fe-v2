<template>
  <el-button
      type="info"
      :icon="Back"
      @click="goBack"
      v-bind="$attrs"
  >
    {{ t('common.back') }}
  </el-button>
</template>

<script lang="ts" setup>
import { useLang } from '@/hooks/web/useI18n'
import { Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const { t } = useLang()

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
