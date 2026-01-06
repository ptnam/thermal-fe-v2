<template>
  <el-form
    :model="model"
    label-width="auto"
    label-position="left"
    size="default"
    :inline="true"
    v-bind="$attrs"
  >
    <slot></slot>
    <el-form-item v-show="visibleSearchButton">
      <SearchButton :loading="loading" @click="emit('search')"></SearchButton>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { ElForm } from "element-plus";
import SearchButton from "@/components/ui/Button/SearchButton.vue";

defineProps({
  model: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    required: false,
  },
  visibleSearchButton: {
    type: Boolean,
    required: false,
    default: true,
  },
});
const emit = defineEmits(["search"]);
</script>
