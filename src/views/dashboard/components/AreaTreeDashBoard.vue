<script lang="ts" setup>
import { useLang } from '@/hooks/web/useI18n'
import {onMounted, ref, watch} from 'vue'
import {TreeInstance} from 'element-plus'
import {isCam} from "@/utils/cameraUtils";

const { t } = useLang()


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

<template>
  <!-- Sidebar Area Tree -->
  <div class="card tree-card">
    <div class="card-header" style="margin-bottom: 20px;">
      <div class="card-title">{{ t('common.areaList') }}</div>
    </div>

    <div style="padding: 0 4px 16px;">
      <el-input
          v-model="filterText"
          class="tree-search-box border-0"
          :placeholder="t('common.searchArea')"
      />
    </div>

    <div class="area-tree">
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
          :expand-on-click-node="false"
          :highlight-current="true"
          v-bind="$attrs"
      >
        <template #default="{ node }">
          <span class="at-node">{{ node.data.name }}</span>
        </template>
      </el-tree>
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
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.alert-count.red {
  background: var(--danger);
  color: white;
  border: none;
}

.alert-count.yellow {
  background: var(--warning);
  color: black;
  border: none;
}

.alert-count.green {
  color: var(--success);
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.red {
  background: var(--danger);
  box-shadow: 0 0 8px var(--danger);
}

.status-dot.yellow {
  background: var(--warning);
  box-shadow: 0 0 8px var(--warning);
}

.status-dot.green {
  background: var(--success);
}

</style>