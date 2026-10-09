<template>
  <div :class="outerClass">
    <!-- TITLE -->
    <div class="modern-tree-title">
      <span>{{ t('common.areaList') }}</span>
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
          :placeholder="t('live.searchPlaceholder')"
      />
    </div>

    <!-- TREE -->
    <div class="modern-area-tree" v-loading="loading">
      <template v-for="area in filteredData" :key="area.id">
        <div class="modern-tree-section-header">
          {{ area.name }}
        </div>

        <TreeNode
            v-for="node in area.children"
            :key="node.id"
            :node="node"
            @nodeClick="(n) => emits('nodeClick', n)"
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
import { useLang } from '@/hooks/web/useI18n'
import {ref, computed, onMounted} from 'vue'
import TreeNode from './TreeNode.vue'

const { t } = useLang()

const props = defineProps({
  requestFn: {
    type: Function,
    required: true,
  },
  outerClass: {
    type: String,
    default: 'card modern-tree-sidebar'
  }
})
const emits = defineEmits(['nodeClick'])
const data = ref<any[]>([])
const keyword = ref('')
const loading = ref(false);

onMounted(async () => {
  void fetch()
})

const fetch = async () => {
  loading.value = true;
  try {

    const res = await props.requestFn()
    data.value = res.data

  }catch (e) {

  }finally {
    loading.value = false;
  }
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