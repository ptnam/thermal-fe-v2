<!-- AreaTreeCustom.vue -->
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import TreeNodeV2 from './TreeNodeV2.vue'

interface AreaNode {
  id: string
  name: string
  totalWarnings?: number
  status?: 'red' | 'yellow' | 'green'
  children?: AreaNode[]
  expanded?: boolean
}

const props = withDefaults(defineProps<{
  requestFn: () => Promise<IResponse<[]>>
  treeClass?: string
}>(), {
  treeClass: 'tree-card'
})

const emit = defineEmits<{
  (e: 'node-click', node: AreaNode): void
}>()

const data = ref<AreaNode[]>([])
const loading = ref(true)
const keyword = ref('')

onMounted(async () => {
  try {
    const res = await props.requestFn()
    data.value = res.data
  } finally {
    loading.value = false
  }
})

const filterTree = (nodes: AreaNode[]): AreaNode[] => {
  if (!keyword.value) return nodes

  const k = keyword.value.toLowerCase()

  const filter = (node: AreaNode): AreaNode | null => {
    const match = node.name.toLowerCase().includes(k)

    if (node.children) {
      const children = node.children
          .map(filter)
          .filter(Boolean) as AreaNode[]

      if (match || children.length) {
        return { ...node, children }
      }
    }

    return match ? { ...node } : null
  }

  return nodes.map(filter).filter(Boolean) as AreaNode[]
}

const filteredData = computed(() => filterTree(data.value))

const handleNodeClick = (node: AreaNode) => {
  emit('node-click', node)
}
</script>

<template>
  <div class="card" :class="treeClass">
    <div class="card-header" style="margin-bottom: 20px;">
      <div class="card-title">Danh sách khu vực</div>
    </div>

    <div style="padding: 0 4px 16px;">
      <el-input
          v-model="keyword"
          type="text"
          placeholder="Tìm theo khu vực"
      />
    </div>

    <div class="area-tree">
      <TreeNodeV2
          v-for="node in filteredData"
          :key="node.id"
          :node="node"
          @node-click="handleNodeClick"
      />
    </div>
  </div>
</template>



