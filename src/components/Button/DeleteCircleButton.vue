<template>
  <el-button
      class="action-btn-circle btn-delete-round"
      type="danger"
      v-bind="$attrs"
      @click="$emit('click')" >
    🗑
  </el-button>
</template>
<script lang="ts" setup>

defineEmits(['click'])
</script>
