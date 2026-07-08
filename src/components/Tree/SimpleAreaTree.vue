<template>
  <el-tree
      ref="treeRef"
      class="filter-tree"
      :data="data"
      :props="{
          children: 'children',
          label: 'name',
          disabled: (data: Tree) => !isCam(data),
        }"
      node-key="uniqueId"
      :filter-node-method="filterNode"
      :default-checked-keys="checkedKeys"
      v-bind="$attrs"
  >
    <template #default="slotProps">
      <slot name="default" v-bind="slotProps"/>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref, watch} from 'vue'
import {TreeInstance} from 'element-plus'
import {isCam} from "@/utils/cameraUtils";

interface Tree {
  [key: string]: any
}

const filterText = ref('')
const treeRef = ref<TreeInstance>()

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: Tree): boolean => {
  if (!value) return true;

  const keyword = value.toLowerCase();

  if (!isCam(data)) {
    return data.name.toLowerCase().includes(keyword);
  }
  return data.area.name.toLowerCase().includes(keyword);
};


const data = ref([])
const checkedKeys = ref<string[]>([])

const props = defineProps<{
  requestFn: (data?: Record<string, any>) => Promise<any>
  defaultCheckedIds?: (number | string)[]
}>()

// Camera `id` values can collide with area `id` values (separate DB tables),
// so the tree uses `uniqueId` as node-key. This resolves plain camera ids
// (the "value") back to their tree uniqueId ("key") once data is loaded.
const resolveCheckedKeys = (nodes: Tree[], ids: Set<number | string>, acc: string[]) => {
  for (const node of nodes) {
    if (isCam(node) && ids.has(node.id)) {
      acc.push(node.uniqueId)
    }
    if (node.children?.length) {
      resolveCheckedKeys(node.children, ids, acc)
    }
  }
  return acc
}

const loading = ref(true)
onMounted(() => {
  props
      .requestFn()
      .then((res) => {
        data.value = res.data
        if (props.defaultCheckedIds?.length) {
          nextTick(() => {
            checkedKeys.value = resolveCheckedKeys(data.value, new Set(props.defaultCheckedIds), [])
          })
        }
      })
      .finally(() => {
        loading.value = false
      })
})

defineExpose({
  treeRef
})
</script>

