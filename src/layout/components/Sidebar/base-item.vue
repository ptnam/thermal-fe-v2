<script setup>
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

defineProps({
  icon: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
})
</script>
<template>
  <template v-if="icon">
    <el-icon v-if="icon.includes('el-icon')" class="sub-el-icon">
      <component :is="icon.replace('el-icon-', '')"></component>
    </el-icon>
    <SvgIcon v-else :name="icon"></SvgIcon>
  </template>
  <span v-if="title">{{ title }}</span>
</template>
