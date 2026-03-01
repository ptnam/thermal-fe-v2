<template>
  <el-button
      class="action-btn-circle btn-edit-round"
      type="primary"
      v-bind="$attrs"
      @click="$emit('click')">✎</el-button>
</template>
<script lang="ts" setup>
defineEmits(['click'])
</script>
