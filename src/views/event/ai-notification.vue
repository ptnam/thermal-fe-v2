<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import { TableColumn } from '@/components/Table'
import PageContainer from '@/components/PageContainer.vue'
import { computed, nextTick, ref } from 'vue'
import { getAllTreeAreaApi } from '@/api/area'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import dayjs from 'dayjs'
import SearchButton from '@/components/Button/SearchButton.vue'
import { getVisionNotificationApi } from '@/api/notification/visionNotification'
import { getAllCamerasApi } from '@/api/camera'
import {getAllWarningEventApi} from '@/api/warning-event'
import { WARNING_TYPE_AI } from '@/constants/warningType'
import { ElImage } from 'element-plus'

const columns = computed<TableColumn[]>(() => [
  {
    width: '120px',
    label: 'Hình ảnh',
    slots: {
      default: ({ row }) => (
        <div class="ai-thumb">
          {row.imagePath && (
            <ElImage
              src={row.imagePath}
              lazy={true}
              fit="cover"
              preview-src-list={[row.imagePath]}
              show-progress={true}
              preview-teleported={true}
            />
          )}
        </div>
      ),
    },
  },
  { prop: 'dateData', label: 'Ngày', width: 120 },
  { prop: 'timeData', label: 'Giờ' },
  { prop: 'areaName', label: 'Khu vực' },
  { prop: 'cameraName', label: 'Tên camera' },
  {
    prop: 'warningEventName',
    label: 'Loại cảnh báo',
    slots: {
      default: ({row}) => (<span   style={{color: 'var(--danger)'}}>{row.warningEventName}</span>)
    },
  },
])

const cameraRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const changeAreaId = (searchParams: GenericObject) => {
  searchParams['cameraId'] = null
  nextTick(() => {
    cameraRef?.value?.fetch()
  })
}
const elTableRef = ref<InstanceType<typeof ListTemplate>>()
</script>

<template>
  <page-container title="Cảnh báo AI">
    <list-template
      ref="elTableRef"
      title="Danh sách Cảnh báo AI"
      key-list="ai-notification"
      :columns="columns"
      :search-props="{ visibleSearchButton: false, inline: false }"
      :show-btn-add="false"
      :use-table-config="{
        fetchDataApi: getVisionNotificationApi,
        searchDefaults: {
          fromTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00'),
        },
      }"
    >
      <template slot="search" v-slot="{ searchParams }">
        <div class="filter-row">
          <div class="filter-item">
            <div class="filter-label">Thời gian từ</div>
            <el-date-picker
                v-model="searchParams.fromTime"
                type="datetime"
                placeholder="Thời gian bắt đầu"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-[-webkit-fill-available]"
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">Thời gian đến</div>
            <el-date-picker
                v-model="searchParams.toTime"
                type="datetime"
                placeholder="Thời gian kết thúc"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-[-webkit-fill-available]"
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">Khu vực</div>
            <tree-select-remote
                v-model="searchParams.areaId"
                :request-fn="getAllTreeAreaApi"
                filterable
                clearable
                @change="() => changeAreaId(searchParams)"
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">Camera</div>
            <virtualized-select-from-url
                ref="cameraRef"
                v-model="searchParams.cameraId"
                :request-fn="() => getAllCamerasApi({ areaId: searchParams.areaId })"
                filterable
                value-key="id"
                clearable
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">Loại cảnh báo</div>
            <virtualized-select-from-url
                ref="warningEventId"
                v-model="searchParams.warningEventId"
                :request-fn="() => getAllWarningEventApi({warningType: WARNING_TYPE_AI})"
                filterable
                value-key="id"
                clearable
            />
          </div>
        </div>
        <search-button @click="elTableRef?.refresh()" />
      </template>
    </list-template>
  </page-container>
</template>
<style scoped>
.ai-thumb {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: 0.2s;
}

.ai-thumb:hover {
  transform: scale(1.2);
  z-index: 10;
}

/* Filter Refinement */
.filter-grid-ai {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: nowrap;
}

.filter-group-ai {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.filter-group-ai label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  /* Removed min-width to save space in single row layout */
}

.input-icon-wrapper {
  position: relative;
  flex: 1;
}

.input-icon-wrapper .filter-input {
  padding-left: 35px !important;
  height: 38px;
}

.input-icon-wrapper .input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-sub);
  opacity: 0.7;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.btn-search-ai {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  transition: 0.2s;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-search-ai:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>