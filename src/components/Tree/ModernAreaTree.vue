<template>
  <div class="card modern-tree-sidebar">
    <!-- TITLE -->
    <div class="modern-tree-title">
      <span>{{ title }}</span>
    </div>

    <!-- SEARCH -->
    <div class="modern-tree-search-wrapper">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"/>
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

      <template v-for="section in filteredData" :key="section[idKey]">

        <!-- SECTION TITLE -->
        <div class="modern-tree-section-header">
          {{ section[labelKey] }}
        </div>

        <!-- CHILDREN -->
        <TreeNode
            v-for="node in section[childrenKey]"
            :key="node[idKey]"
            :node="node"
            :label-key="labelKey"
            :children-key="childrenKey"
            :id-key="idKey"
            :current-id="currentId"
            @select="handleSelect"
        />

      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TreeNode from './TreeNode.vue'

interface TreeProps {
  children?: string
  label?: string
}

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },

  props: {
    type: Object as () => TreeProps,
    default: () => ({
      children: 'children',
      label: 'name'
    })
  },

  nodeKey: {
    type: String,
    default: 'id'
  },

  title: {
    type: String,
    default: 'Danh sách khu vực'
  },

  mobileClosable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['node-click','close'])

const keyword = ref('')
const currentId = ref<any>(null)

const childrenKey = computed(() => props.props.children || 'children')
const labelKey = computed(() => props.props.label || 'name')
const idKey = computed(() => props.nodeKey)

function filterNode(node:any) {
  if (!keyword.value) return true

  return node[labelKey.value]
      .toLowerCase()
      .includes(keyword.value.toLowerCase())
}

const filteredData = computed(() => {

  function filter(list:any[]):any[] {
    return list
        .map(node => {

          const children = node[childrenKey.value]
              ? filter(node[childrenKey.value])
              : []

          if (filterNode(node) || children.length) {
            return {
              ...node,
              [childrenKey.value]: children
            }
          }

          return null
        })
        .filter(Boolean)
  }

  return filter(props.data)
})

function handleSelect(node:any) {

  currentId.value = node[idKey.value]

  emit('node-click', node)
}
</script>