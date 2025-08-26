<template>
  <div>
    <el-divider class="my-4!"/>
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
        <search-button :loading="loading" @click="emit('search')"></search-button>
      </el-form-item>
    </el-form>
    <el-divider class="my-4!"/>
  </div>
</template>
<script setup lang="ts">
import {ElForm} from 'element-plus'
import SearchButton from "@/components/Button/SearchButton.vue";

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
    default: true
  }
})
const emit = defineEmits(['search'])
</script>
