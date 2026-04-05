<script setup lang="ts">
import {provide, ref} from "vue";
import {ElDrawer} from "element-plus";

const dialogRef = ref<InstanceType<typeof ElDrawer>>()

function cancelDialog() {
  dialogRef.value?.handleClose()
}

provide('cancelDialog', cancelDialog)
</script>
<template>
  <el-drawer
      ref="dialogRef"
      :destroy-on-close="true"
      resizable
      :with-header="false"
      v-bind="$attrs">
    <slot></slot>
  </el-drawer>
</template>