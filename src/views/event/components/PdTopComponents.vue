<template>
  <PdWidgetCard v-loading="loading">
    <template #title>{{ t('pd.top.title') }}</template>
    <template #filters>
      <el-input v-model="keyword" :placeholder="t('pd.top.searchPlaceholder')" clearable :prefix-icon="Search" class="search-input" />
      <TreeSelectRemote
          v-model="areaId"
          :request-fn="getAllTreeAreaApi"
          filterable
          clearable
          :placeholder="t('pd.top.allAreas')"
          class="area-select"
          @change="load"
      />
      <el-select v-model="count" class="count-select" @change="load">
        <el-option v-for="n in countOptions" :key="n" :label="`Top ${n}`" :value="n" />
      </el-select>
    </template>

    <el-table :data="filteredRows" :empty-text="t('pd.top.empty')">
      <el-table-column label="#" width="56" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="areaName" :label="t('fields.area')" min-width="200" />
      <el-table-column prop="machineName" :label="t('alert.equipment')" width="150" />
      <el-table-column prop="machineComponentName" :label="t('alert.component')" width="170" />
      <el-table-column prop="cameraCode" label="Camera" width="150" />
      <el-table-column prop="zoneName" :label="t('dashboard.cameraZone')" width="160" />
      <el-table-column :label="t('dashboard.measuredIntensity')" width="150" align="center">
        <template #default="{ row }">{{ (row as PdComponentRankingRow).lastLevelDb }} dB</template>
      </el-table-column>
      <el-table-column :label="t('alert.evaluation')" width="130" align="center">
        <template #default="{ row }">
          <el-tag :type="evaluationTagType(row as PdComponentRankingRow)" size="small">
            {{ (row as PdComponentRankingRow).lastEvaluationLevelObject?.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('pd.top.updatedAt')" width="170">
        <template #default="{ row }">{{ formatDate((row as PdComponentRankingRow).lastReadAt) }}</template>
      </el-table-column>
    </el-table>
  </PdWidgetCard>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import { Search } from '@element-plus/icons-vue'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import PdWidgetCard from './PdWidgetCard.vue'
import { getAllTreeAreaApi } from '@/api/area'
import { pdTopComponentsApi } from '@/api/pd-data'
import { computed, onMounted, ref } from 'vue'

const { t } = useLang()

// Snapshot PdComponentBaseline mới nhất (không phải lịch sử theo thời gian như các widget khác) -
// trả lời "đang cần ưu tiên kiểm tra bộ phận nào".
interface PdComponentRankingRow {
  machineComponentId: number
  areaName?: string
  machineName?: string
  machineComponentName?: string
  cameraCode?: string
  zoneName?: string
  lastLevelDb?: number
  lastReadAt?: string
  lastDeltaPdPercent?: number
  lastEvaluationLevelObject?: { code: string; name: string }
}

const EVALUATION_TAG_TYPE: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  Good: 'success',
  Fair: 'info',
  Average: 'warning',
  Bad: 'danger',
}
function evaluationTagType(row: PdComponentRankingRow) {
  return EVALUATION_TAG_TYPE[row.lastEvaluationLevelObject?.code ?? ''] ?? 'info'
}

const countOptions = [5, 10, 20, 50]
const count = ref(10)
const areaId = ref<number | null>(null)
const rows = ref<PdComponentRankingRow[]>([])
const loading = ref(false)
const keyword = ref('')

// Danh sách Top N đã nhỏ sẵn (tối đa 50) - lọc theo từ khoá ngay trên trình duyệt, không cần gọi lại API.
const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) =>
    [r.areaName, r.machineName, r.machineComponentName].some((v) => (v ?? '').toLowerCase().includes(q)),
  )
})

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function load() {
  loading.value = true
  try {
    const res = await pdTopComponentsApi({ areaId: areaId.value ?? undefined, count: count.value })
    rows.value = res.data as any
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.search-input {
  width: 200px;
}

.area-select {
  width: 200px;
}

.count-select {
  width: 100px;
}
</style>
