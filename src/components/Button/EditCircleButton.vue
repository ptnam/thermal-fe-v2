<template>
  <el-button circle type="primary" v-bind="$attrs" @click="$emit('click')" :icon="EditPen" />
</template>
<script lang="ts" setup>
import { EditPen } from '@element-plus/icons-vue'

defineEmits(['click'])
</script>
