<template>
  <PageContainer>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('pd.tabThresholdStats')" name="threshold-stats">
        <div class="stats-tab">
          <div class="filter-section-modern">
            <div class="filter-row-inline">
              <div class="filter-group-inline">
                <label>{{ t('fields.area') }}</label>
                <TreeSelectRemote
                    v-model="draftAreaId"
                    :request-fn="getAllTreeAreaApi"
                    filterable
                    clearable
                    :placeholder="t('pd.select')"
                />
              </div>
              <div class="filter-group-inline">
                <label>{{ t('alert.fromDate') }}</label>
                <el-date-picker
                    v-model="draftStartDate"
                    type="date"
                    :placeholder="t('alert.startDate')"
                    value-format="YYYY-MM-DD"
                    class="select-single-modern !w-full"
                />
              </div>
              <div class="filter-group-inline">
                <label>{{ t('alert.toDate') }}</label>
                <el-date-picker
                    v-model="draftEndDate"
                    type="date"
                    :placeholder="t('alert.endDate')"
                    value-format="YYYY-MM-DD"
                    class="select-single-modern !w-full"
                />
              </div>
              <button class="btn-search-primary" @click="applyFilter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                {{ t('common.search') }}
              </button>
              <el-button :loading="isLoadingExport" class="btn-export" @click="exportFile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </el-button>
            </div>
          </div>
          <PdResolutionStats :area-id="areaId" :start-date="searchParams.startDate" :end-date="searchParams.endDate" />
          <PdThresholdStats :area-id="areaId" :start-date="searchParams.startDate" :end-date="searchParams.endDate" />
          <div class="stats-row">
            <PdAreaComparison :area-id="areaId" :start-date="searchParams.startDate" :end-date="searchParams.endDate" />
            <PdLevelDistribution :area-id="areaId" :start-date="searchParams.startDate" :end-date="searchParams.endDate" />
          </div>
          <PdTopComponents />
        </div>
      </el-tab-pane>
      <el-tab-pane :label="t('pd.tabLevelLog')" name="level-log">
        <PdLevelLog />
      </el-tab-pane>
    </el-tabs>
  </PageContainer>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import PageContainer from '@/components/Container/PageContainer.vue'
import PdLevelLog from '@/views/event/components/PdLevelLog.vue'
import PdThresholdStats from '@/views/event/components/PdThresholdStats.vue'
import PdTopComponents from '@/views/event/components/PdTopComponents.vue'
import PdLevelDistribution from '@/views/event/components/PdLevelDistribution.vue'
import PdAreaComparison from '@/views/event/components/PdAreaComparison.vue'
import PdResolutionStats from '@/views/event/components/PdResolutionStats.vue'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import { getAllTreeAreaApi } from '@/api/area'
import { exportPdCountApi } from '@/api/notification'
import { downloadFile } from '@/utils/response'
import useRequest from '@/hooks/web/useRequest'
import { ref } from 'vue'

const { t } = useLang()

// Bộ lọc Khu vực + Khoảng thời gian DÙNG CHUNG cho cả tab "Thống kê phóng điện vượt ngưỡng" - trước đây mỗi
// widget tự có 1 bộ lọc riêng (khác giá trị nhau, dễ gây nhầm lẫn khi so sánh). PdTopComponents là
// snapshot mới nhất (không có khái niệm khoảng thời gian ở BE) nên vẫn giữ bộ lọc area/keyword/count
// riêng, không dùng bộ lọc chung này.
//
// draft* là giá trị đang chỉnh trên UI - chỉ ghi đè areaId/searchParams (áp dụng thật, truyền cho các
// widget con) khi bấm "TÌM KIẾM", tránh gọi lại API liên tục mỗi lần đổi khu vực/ngày (giống UX
// ThresholdWarning.vue của Tổng hợp dữ liệu nhiệt độ).
const activeTab = ref('threshold-stats')

const formatDate = (date: Date): string => date.toISOString().split('T')[0]
const today = new Date()
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(today.getDate() - 6)

const draftAreaId = ref<number | null>(null)
const draftStartDate = ref(formatDate(sevenDaysAgo))
const draftEndDate = ref(formatDate(today))

const areaId = ref<number | null>(null)
const searchParams = ref({
  startDate: formatDate(sevenDaysAgo),
  endDate: formatDate(today),
})

function applyFilter() {
  areaId.value = draftAreaId.value
  searchParams.value = { startDate: draftStartDate.value, endDate: draftEndDate.value }
}

const { onRequest: requestExport, isLoading: isLoadingExport } = useRequest()
function exportFile() {
  requestExport(exportPdCountApi, {
    areaId: areaId.value ?? undefined,
    startDate: searchParams.value.startDate,
    endDate: searchParams.value.endDate,
  }).then((res: any) => {
    downloadFile(res)
  })
}
</script>

<style scoped>
.stats-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}

@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

/* Bộ lọc chung - phong cách tham khảo ThresholdWarning.vue (Tổng hợp dữ liệu nhiệt độ, /event/home) */
.filter-section-modern {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row-inline {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-group-inline {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  flex: 1;
}

.filter-group-inline label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.select-single-modern {
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  min-height: 38px;
}

.btn-search-primary {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 24px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.btn-search-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-export {
  background: var(--success);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.btn-export:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
