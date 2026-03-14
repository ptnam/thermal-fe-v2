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
        <path d="M6 9l6 6 6-6"/>
      </svg>

    </div>

    <div v-if="hasChildren && expanded" class="modern-at-children">

      <template
          v-for="child in node?.[childrenKey]"
          :key="child[idKey]"
      >

        <TreeNode
            v-if="child[childrenKey]"
            :node="child"
            :label-key="labelKey"
            :children-key="childrenKey"
            :id-key="idKey"
            :current-id="currentId"
            @select="$emit('select',$event)"
        />

        <div
            v-else
            class="modern-at-leaf"
            :class="{ active: child[idKey] === currentId }"
            @click.stop="$emit('select',child)"
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

const props = defineProps({
  node: Object,
  labelKey: String,
  childrenKey: String,
  idKey: String,
  currentId: [String,Number]
})

const expanded = ref(true)

const hasChildren = computed(() =>
    props.node?.[props.childrenKey]?.length
)

function toggle(){

  if (hasChildren.value){
    expanded.value = !expanded.value
  }
}
</script>