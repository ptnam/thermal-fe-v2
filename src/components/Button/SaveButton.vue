<template>
  <el-button type="primary" v-bind="$attrs" :icon="Collection">{{ t('common.save') }}</el-button>
</template>
<script lang="ts" setup>
import { useLang } from '@/hooks/web/useI18n'
import {
  Collection
} from '@element-plus/icons-vue'

const { t } = useLang()
</script>