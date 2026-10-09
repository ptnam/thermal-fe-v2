<template>
  <el-button type="info" v-bind="$attrs" :icon="Close">{{ t('common.cancel') }}</el-button>
</template>
<script lang="ts" setup>
import { useLang } from '@/hooks/web/useI18n'
import { Close } from '@element-plus/icons-vue'

const { t } = useLang()
</script>
