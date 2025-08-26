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
      :highlight-current="true"
      v-bind="$attrs"
  >
    <template #default="slotProps">
      <slot name="default" v-bind="slotProps"/>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {TreeInstance} from 'element-plus'

const treeRef = ref<TreeInstance>()

const data = ref([])

const props = defineProps<{
  requestFn: (data?: Record<string, any>) => Promise<any>
}>()

const loading = ref(true)

onMounted(() => {
  fetch()
})

const fetch = async () => {
  props
      .requestFn()
      .then((res) => {
        data.value = res.data.items
      })
      .finally(() => {
        loading.value = false
      })
}

defineExpose({
  fetch,
})
</script>

