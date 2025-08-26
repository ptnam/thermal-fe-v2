<template>
  <el-tag color="">{{ t(`status_types.${tag}`)}}</el-tag>
</template>
<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'

const {t} = useLang()
 defineProps({
  tag: {
    type: String,
    default: false,
  },
})
</script>