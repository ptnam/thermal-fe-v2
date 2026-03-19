<template>
  <el-tree-select
      :loading="loading"
      v-model="modelValue"
      :render-after-expand="false"
      :check-strictly="true"
      value-key="id"
      :props="{
        label: 'name',
        children: 'children',
      }"
      :data="data"
      v-bind="$attrs"
  >
  </el-tree-select>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

const modelValue = defineModel<any>('modelValue', {required: true})
const props = defineProps<{
  requestFn: (data?: Record<string, any>) => Promise<any>
}>()

const data = ref([])
const loading = ref(true)
onMounted(() => {
  props
      .requestFn()
      .then((res) => {
        data.value = res.data
      })
      .finally(() => {
        loading.value = false
      })
})
</script>
