<template>
  <div class="filter-group">
    <div class="filter-group-header" @click="toggleOpen">
      <div class="filter-group-header-left" style="display: flex; align-items: center; gap: 10px;">
        <span class="filter-header-title">{{ title }}</span>
      </div>

      <svg
        class="collapsible-arrow"
        :class="{ open: isOpen }"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      >
        <path d="M6 9l6 6 6-6"></path>
      </svg>
    </div>

    <div v-show="isOpen" class="filter-group-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Array], required: false },
  title: { type: String, required: false },
  defaultOpen: { type: Boolean, required: false },
})
const isOpen = ref(props.defaultOpen)
function toggleOpen() {
  isOpen.value = !isOpen.value
}

</script>

<style scoped>
.custom-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  flex-shrink: 0;
  background: #ffffff;
}

.drawer-filter-item.active .custom-checkbox {
  background: #3b82f6;
  border-color: #3b82f6;
}

.custom-checkbox svg {
  width: 12px;
  height: 12px;
  color: white;
  display: none;
}

.drawer-filter-item.active .custom-checkbox svg {
  display: block;
}

/* Group Collapsible */
.filter-group-content {
  display: block;
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.filter-group.collapsed .filter-group-content {
  max-height: 0;
  padding-bottom: 0;
}

.filter-group.collapsed .filter-group-header svg {
  transform: rotate(-90deg);
}

.filter-group-header svg {
  transition: transform 0.2s ease;
}

.time-group {
  margin-bottom: 16px;
}

.time-label {
  font-size: 13px;
  color: var(--text-sub);
  margin-bottom: 8px;
  display: block;
}
.drawer-body::-webkit-scrollbar-thumb,
.scroll-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.scroll-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}
/* Group Collapsible */
.filter-group-content {
  display: block;
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.filter-group.collapsed .filter-group-content {
  max-height: 0;
  padding-bottom: 0;
}

.filter-group.collapsed .filter-group-header svg {
  transform: rotate(-90deg);
}

.filter-group-header svg {
  transition: transform 0.2s ease;
}

.time-group {
  margin-bottom: 16px;
}
.filter-group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}
.filter-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.drawer-filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.15s;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
}

.drawer-filter-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.drawer-filter-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: #ffffff;
}
</style>