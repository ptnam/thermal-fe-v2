<template>
  <el-dialog
      ref="dialogRef"
      center align-center
      :draggable="true"
      :close-on-click-modal="false"
      :append-to-body="true"
      v-bind="$attrs">
    <slot></slot>
  </el-dialog>
</template>
<script setup lang="ts">
import {provide, ref} from 'vue'
import {ElDialog} from 'element-plus'

const dialogRef = ref<InstanceType<typeof ElDialog>>()

function cancelDialog() {
  dialogRef.value?.handleClose()
}

provide('cancelDialog', cancelDialog)
</script>
