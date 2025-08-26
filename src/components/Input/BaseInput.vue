<template>
  <el-input v-model="modelValue" v-bind="$attrs" />
</template>
<script setup lang="ts">
const modelValue = defineModel<any>('modelValue', { required: true })
</script>
