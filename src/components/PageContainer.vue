<template>
  <slot></slot>
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
