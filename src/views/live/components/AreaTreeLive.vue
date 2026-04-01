<template>
  <div class="card modern-tree-sidebar">
    <!-- TITLE -->
    <div class="modern-tree-title">
      <span>Danh sách khu vực</span>
    </div>

    <!-- SEARCH -->
    <div class="modern-tree-search-wrapper">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
          v-model="keyword"
          type="text"
          class="modern-tree-search-box"
          placeholder="Tìm trạm, camera..."
      />
    </div>

    <!-- TREE -->
    <div class="modern-area-tree">
      <template v-for="area in filteredData" :key="area.id">
        <div class="modern-tree-section-header">
          {{ area.name }}
        </div>

        <TreeNode
            v-for="node in area.children"
            :key="node.id"
            :node="node"
            @nodeClick="emits('nodeClick', node)"
        >
          <template #default="scope">
            <slot v-bind="scope"/>
          </template>
        </TreeNode>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps<{
  requestFn: (data?: any) => Promise<any>
}>()
const emits = defineEmits(['nodeClick'])
const data = ref<any[]>([])
const keyword = ref('')

onMounted(async () => {
  fetch()
})

const fetch = async () => {
  const res = await props.requestFn()
  data.value = res.data
}

const filterNode = (node: any, keyword: string): boolean => {
  if (!keyword) return true
  if (node.name.toLowerCase().includes(keyword.toLowerCase())) return true
  return node.children?.some((c: any) => filterNode(c, keyword))
}

const filteredData = computed(() => {
  return data.value.filter((area) => filterNode(area, keyword.value))
})

defineExpose({
  fetch
})
</script>