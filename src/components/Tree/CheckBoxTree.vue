<template>
  <el-tree
      ref="treeRef"
      class="filter-tree"
      :data="data"
      :props="{
        children: 'children',
        label: 'name',
      }"
      node-key="id"
      show-checkbox
      :default-checked-keys="modelValue"
      :highlight-current="true"
      @check-change="handleCheckChange"
      v-bind="$attrs"
  >
    <template #default="slotProps">
      <slot name="default" v-bind="slotProps" />
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { TreeInstance } from 'element-plus'

const treeRef = ref<TreeInstance>()
const data = ref([])
const loading = ref(true)

const props = defineProps<{
  requestFn: (data?: Record<string, any>) => Promise<any>
  modelValue: (string | number)[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
  (e: 'check-change', data: any, checked: boolean, indeterminate: boolean): void
}>()

onMounted(() => {
  fetch()
})

const fetch = async () => {
  props.requestFn()
      .then((res) => {
        data.value = res.data
      })
      .finally(() => {
        loading.value = false
      })
}

// 🔥 Sync từ ngoài vào (v-model change)
watch(
    () => props.modelValue,
    (val) => {
      if (treeRef.value) {
        treeRef.value.setCheckedKeys(val || [])
      }
    },
    { immediate: true }
)

const handleCheckChange = (dataNode: any, checked: boolean, indeterminate: boolean) => {
  const keys = treeRef.value?.getCheckedKeys() || []

  emit('update:modelValue', keys)
  emit('check-change', dataNode, checked, indeterminate)
}

defineExpose({
  fetch,
})
</script>