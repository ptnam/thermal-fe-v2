<script lang="ts" setup>
interface AreaNode {
  id: string
  name: string
  totalWarnings?: number
  status?: 'red' | 'yellow' | 'green'
  children?: AreaNode[]
  expanded?: boolean
}

const props = defineProps<{
  node: AreaNode
}>()

const emit = defineEmits<{
  (e: 'node-click', node: AreaNode): void
}>()

const toggle = () => {
  props.node.expanded = !props.node.expanded
}

const clickItem = () => {

  emit('node-click', props.node)
}
</script>

<template>
  <div class="at-node" :class="{ expanded: node.expanded }">
    <div class="at-item">
      <svg
          v-if="node.children?.length"
          class="at-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          @click="toggle"
      >
        <path d="M9 18l6-6-6-6"></path>
      </svg>
      <div v-else style="width:14px"></div>

      <span @click="clickItem">{{ node.name }}</span>

      <div class="at-badge">
        <span class="alert-count yellow">{{ node.totalWarnings || 0 }}</span>
        <span class="status-dot yellow"></span>
      </div>
    </div>

    <div v-if="node.children && node.expanded" class="at-children">
      <TreeNodeV2
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          @node-click="$emit('node-click', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.alert-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.alert-count.red {
  background: red;
  color: white
}

.alert-count.yellow {
  background: orange;
  color: black
}

.alert-count.green {
  color: green
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.red {
  background: red
}

.status-dot.yellow {
  background: orange
}

.status-dot.green {
  background: green
}
</style>
