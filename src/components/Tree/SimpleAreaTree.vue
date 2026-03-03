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
      :filter-node-method="filterNode"
      v-bind="$attrs"
  >
    <template #default="slotProps">
      <slot name="default" v-bind="slotProps"/>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
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

const props = defineProps<{
  requestFn: (data?: Record<string, any>) => Promise<any>
}>()

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

