<script setup lang="ts">
import {provide, ref} from "vue";
import { ElDrawer} from "element-plus";

const emits = defineEmits(['save'])
const dialogRef = ref<InstanceType<typeof ElDrawer>>()
defineProps({
  title: {type: String}
})
function cancelDialog() {
  dialogRef.value?.handleClose()
}

provide('cancelDialog', cancelDialog)
</script>
<template>
  <el-drawer v-bind="$attrs" ref="dialogRef" :destroy-on-close="true" resizable :with-header="false">
    <slot></slot>
  </el-drawer>
</template>