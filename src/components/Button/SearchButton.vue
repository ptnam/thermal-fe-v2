<template>
  <el-button type="primary" :icon="Search" v-bind="$attrs">
    {{ t('common.search') }}
  </el-button>
</template>
<script lang="ts" setup>
import {
  Search
} from '@element-plus/icons-vue'
import {useLang} from '@/hooks/web/useI18n.js'

const {t} = useLang()
</script>