<template>
  <el-card class="m-4 h-full">
    <h5 v-if="title" class="mb-2">{{ t(title) }}</h5>
    <slot></slot>
  </el-card>
</template>
<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'

const { t } = useLang()
defineProps({
  title: {
    type: String,
    required: false,
  },
})
</script>
