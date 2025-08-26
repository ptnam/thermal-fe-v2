<template>
  <el-button circle type="danger" v-bind="$attrs" @click="$emit('click')" :icon="DeleteFilled" />
</template>
<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'

defineEmits(['click'])
</script>
