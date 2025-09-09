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
import { getAllTypeWarningEventApi } from '@/api/warning-event'
import { WARNING_TYPE_AI } from '@/constants/warningType'
import { ElImage } from 'element-plus'

const columns = computed<TableColumn[]>(() => [
  {
    width: '120px',
    label: 'Hình ảnh',
    slots: {
      default: ({ row }) => (
        <div>
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
  { prop: 'warningEventName', label: 'Loại cảnh báo' },
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
      key-list="ai-notification"
      :columns="columns"
      :search-props="{ visibleSearchButton: false, inline: false }"
      :use-table-config="{
        fetchDataApi: getVisionNotificationApi,
        searchDefaults: {
          fromTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00'),
        },
      }"
    >
      <template v-slot:top><span></span></template>
      <template slot="search" v-slot="{ searchParams }">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Thời gian từ">
              <el-date-picker
                v-model="searchParams.fromTime"
                type="datetime"
                placeholder="Thời gian bắt đầu"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-[-webkit-fill-available]"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Thời gian đến">
              <el-date-picker
                v-model="searchParams.toTime"
                type="datetime"
                placeholder="Thời gian kết thúc"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-[-webkit-fill-available]"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Khu vực">
              <tree-select-remote
                v-model="searchParams.areaId"
                :request-fn="getAllTreeAreaApi"
                filterable
                clearable
                @change="() => changeAreaId(searchParams)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="searchParams.areaId">
            <el-form-item label="Camera">
              <virtualized-select-from-url
                ref="cameraRef"
                v-model="searchParams.cameraId"
                :request-fn="() => getAllCamerasApi({ areaId: searchParams.areaId })"
                filterable
                value-key="id"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Loại cảnh báo">
              <virtualized-select-from-url
                ref="warningEventId"
                v-model="searchParams.warningEventId"
                :request-fn="() => getAllTypeWarningEventApi(WARNING_TYPE_AI)"
                filterable
                value-key="id"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="flex justify-center">
          <search-button @click="elTableRef?.refresh()" />
        </div>
      </template>
    </list-template>
  </page-container>
</template>
