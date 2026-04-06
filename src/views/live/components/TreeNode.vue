<template>
  <div class="modern-at-node" :class="[ isOpen ? 'expanded' :'open' ]">
    <div v-if="hasChildren" class="modern-at-item">
      <div class="modern-at-parent-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <span class="card-title" @click="nodeClick">{{ node.name }}</span>
      <svg  @click="toggle" class="modern-at-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M6 9l6 6 6-6"></path>
      </svg>
    </div>
    <!-- CHILDREN -->
    <div v-if="hasChildren" class="modern-at-children">
      <TreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          @nodeClick="emits('nodeClick', node)"
      >
        <template #default="scope">
          <slot v-bind="scope"/>
        </template>
      </TreeNode>
    </div>
    <div v-else class="modern-at-children">
      <div class="modern-at-leaf" :class="[node.cameraType === 'Thermal' ? 'thermal': '']">
        <div class="modern-at-leaf-icon-box">
          <div class="modern-online-dot"></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </div>
        <span @click="nodeClick">{{ node.name }}</span>
        <svg v-if="node.isPined" class="modern-flag-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor"
             stroke-width="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'

const props = defineProps<{
  node: any
}>()
const emits = defineEmits(['nodeClick'])

const isOpen = ref(true)

const hasChildren = computed(() => props.node.children?.length)

const toggle = () => {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value
  }
}

const nodeClick = () => {
  emits('nodeClick', props.node)
}
</script>