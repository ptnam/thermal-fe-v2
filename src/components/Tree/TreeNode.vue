<template>
  <div class="modern-at-node" :class="{ open: expanded }">
    <div class="modern-at-item" @click="toggle">
      <div class="modern-at-parent-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>

      <span class="card-title">
        {{ node?.[labelKey] }}
      </span>

      <svg
        v-if="hasChildren"
        class="modern-at-arrow"
        viewBox="0 0 24 24"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>

    <div v-if="hasChildren && expanded" class="modern-at-children">
      <template
        v-for="child in childNodes"
        :key="child[idKey]"
      >
        <TreeNode
          v-if="hasChildChildren(child)"
          :node="child"
          :label-key="labelKey"
          :children-key="childrenKey"
          :id-key="idKey"
          :current-id="currentId"
          @select="emit('select', $event)"
        />

        <div
          v-else
          class="modern-at-leaf"
          :class="{ active: child[idKey] === currentId }"
          @click.stop="emit('select', child)"
        >
          <div class="modern-at-leaf-icon-box">
            <div class="modern-online-dot"></div>
            📷
          </div>

          <span>
            {{ child[labelKey] }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TreeNode from './TreeNode.vue'

type TreeValue = string | number

interface TreeItem {
  [key: string]: TreeValue | TreeItem[] | undefined
}

const props = defineProps<{
  node?: TreeItem
  labelKey: string
  childrenKey: string
  idKey: string
  currentId?: string | number
}>()

const emit = defineEmits<{
  (e: 'select', value: TreeItem): void
}>()

const expanded = ref(true)

const childNodes = computed<TreeItem[]>(() => {
  const children = props.node?.[props.childrenKey]
  return Array.isArray(children) ? children : []
})

const hasChildren = computed<boolean>(() => {
  return childNodes.value.length > 0
})

function hasChildChildren(child: TreeItem): boolean {
  const children = child[props.childrenKey]
  return Array.isArray(children) && children.length > 0
}

function toggle(): void {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  }
}
</script>