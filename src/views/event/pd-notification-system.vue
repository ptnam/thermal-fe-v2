<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {computed, nextTick, ref} from 'vue'
import {getAllTreeAreaApi} from '@/api/area'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import {ElButton, ElImage, ElMessage} from 'element-plus'
import {Select, View} from '@element-plus/icons-vue'
import {useConfirmModal} from '@/hooks/web/useModal'
import cameraImg from '@/assets/map/camera-sensor-good.jpg'
import {
  listNotificationApi,
  notificationDetailApi,
  notificationExportApi,
  updateNotificationStatusApi,
} from '@/api/notification'
import {getAllMachineApi} from '@/api/machine'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import dayjs from 'dayjs'
import NotificationFormDetail from '@/views/event/components/NotificationFormDetail.vue'
import useRequest from '@/hooks/web/useRequest'
import SearchButton from '@/components/Button/SearchButton.vue'
import ExportButton from '@/components/Button/ExportButton.vue'
import {createSignalRConnection, invokeSignalR, onSignalREvent, startSignalR, stopSignalR} from '@/plugins/signalr'
import {downloadByPathApi} from '@/api/common'
import {downloadFile} from '@/utils/response'
import PdNotificationSystemCard from '@/views/event/components/PdNotificationSystemCard.vue'
import {onMounted, onUnmounted} from 'vue'
import {useAppStore} from '@/store/modules/app'

// Khoá cứng warningEventCode = PD_EXCEEDED - tái dùng nguyên API/quyền của notification-system.vue.
const PD_WARNING_EVENT_CODE = 'PD_EXCEEDED'

const {confirmModal} = useConfirmModal()

const typeStatus = {
  Resolved: 'success',
  Pending: 'danger',
}
const changeStatus = (row: any) => {
  confirmModal('Cập nhật trạng thái', 'Bạn có chắc muốn cập nhật trạng thái đã xử lý?', () => {
    updateNotificationStatusApi(row.id, {
      status: row.statusObject.code === 'Pending' ? 2 : 1,
      dataTime: row.dataTime,
    }).then(() => {
      ElMessage({message: 'Lưu thành công!', type: 'success'})
      elTableRef?.value?.refresh()
    })
  })
}

// compareTypeObject luôn = "PdGrowthRate" (BE ghi cố định, xem PdDataService.BuildNotification) -
// tiêu chí thật quyết định kết quả nằm ở evaluationThresholdType (7=ΔPD%/kỳ, 8=ngưỡng dB).
function pdCriteriaLabel(row: any) {
  return row.evaluationThresholdType === 8 ? 'So với ngưỡng cường độ PD' : 'So với tốc độ tăng ΔPD% theo kỳ'
}

// Mở drawer bên phải như notification-system.vue (nhiệt độ) - đồng nhất UI giữa 2 màn, khác forest-fe
// (forest-fe điều hướng full-page cho PD). Route pd_notification_detail vẫn giữ cho bell dropdown.
const formModel = ref<any>({
  id: null,
  compareResultObject: {},
  compareTypeObject: {},
  statusObject: {},
})
const detailVisible = ref(false)
const {onRequest, isLoading} = useRequest()
const appStore = useAppStore()
const isMobile = computed(() => appStore.isMobile)

function openDetail(row: any) {
  detailVisible.value = true
  onRequest(notificationDetailApi, {id: row.id, dataTime: row.dataTime}).then((res) => {
    formModel.value = res.data
  })
}
function updateStatusSuccess() {
  detailVisible.value = false
  ElMessage({message: 'Lưu thành công!', type: 'success'})
  elTableRef?.value?.refresh()
}

const columns = computed<TableColumn[]>(() => [
  {
    width: '120px',
    slots: {
      default: ({row}) => (
        <div>
          <ElButton type={typeStatus[row?.statusObject?.code]} circle onClick={() => changeStatus(row)} icon={Select}></ElButton>
          <ElButton circle onClick={() => openDetail(row)} icon={View}></ElButton>
        </div>
      ),
    },
  },
  {
    width: '120px',
    label: 'Hình ảnh',
    align: 'center',
    slots: {
      default: ({row}) => (
        <div>
          {row.dataSourceType === 1 ? (
            <img src={cameraImg} alt="sensor"/>
          ) : (
            row.imagePath && (
              <ElImage src={row.imagePath} lazy fit="cover" preview-src-list={[row.imagePath]} show-progress preview-teleported/>
            )
          )}
        </div>
      ),
    },
  },
  {prop: 'dateData', label: 'Ngày', width: 120},
  {prop: 'timeData', label: 'Giờ', width: 120},
  {prop: 'areaName', label: 'Khu vực', minWidth: 200},
  {prop: 'cameraCode', label: 'Camera', width: 120},
  {prop: 'zoneName', label: 'Vùng trên camera', width: 150},
  {prop: 'machineName', label: 'Thiết bị', width: 120},
  {prop: 'machineComponentName', label: 'Bộ phận', width: 140},
  {
    prop: 'componentValue',
    label: 'Cường độ PĐ',
    width: 130,
    slots: {
      default: ({row}) => <span>{row.componentValue} dB</span>,
    },
  },
  {
    label: 'Kiểu cảnh báo',
    width: 240,
    slots: {
      default: ({row}) => <span>{pdCriteriaLabel(row)}</span>,
    },
  },
  {prop: 'compareResultObject.name', label: 'Đánh giá', width: 110},
  {prop: 'statusObject.name', label: 'Trạng thái', width: 120},
  {prop: 'resolveTime', label: 'Thời gian xử lý', width: 140},
])

const machineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const changeAreaId = (searchParams: GenericObject) => {
  searchParams['machineId'] = null
  nextTick(() => machineRef?.value?.fetch())
}
const elTableRef = ref<InstanceType<typeof ListTemplate>>()

onMounted(() => {
  createSignalRConnection()
  startSignalR()
  onSignalREvent('exportCompleted', function (jobId: any) {
    downloadByPathApi(`/api/Export/download/${jobId}`).then((res) => {
      downloadFile(res)
    }).finally(() => {
      isExportLoading.value = false
    })
  })
})
onUnmounted(() => {
  stopSignalR()
})
const isExportLoading = ref(false)
const {onRequest: requestExport} = useRequest()
const exportFile = (searchParams: any) => {
  isExportLoading.value = true
  requestExport(notificationExportApi, searchParams).then((res) => {
    invokeSignalR('RegisterJob', res.jobId)
    ElMessage.success('File sẽ tự động download sau khi đã xuất xong')
  })
}
</script>

<template>
  <list-template
      ref="elTableRef"
      title="Danh sách Phóng điện vượt ngưỡng"
      key-list="pd-notification-system"
      :columns="columns"
      :search-props="{ visibleSearchButton: false, inline: false, className:'' }"
      :use-table-config="{
        fetchDataApi: listNotificationApi,
        searchDefaults: {
          fromTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00'),
          warningEventCode: PD_WARNING_EVENT_CODE,
        },
      }"
      :show-btn-add="false"
      :card-component="PdNotificationSystemCard"
  >
    <template slot="search" v-slot="{ searchParams }">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">Thời gian từ</div>
          <el-date-picker
              v-model="searchParams.fromTime"
              type="datetime"
              placeholder="Thời gian bắt đầu"
              format="YYYY/MM/DD hh:mm:ss A"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Thời gian đến</div>
          <el-date-picker
              v-model="searchParams.toTime"
              type="datetime"
              placeholder="Thời gian kết thúc"
              format="YYYY/MM/DD hh:mm:ss A"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Khu vực</div>
          <tree-select-remote
              class="filter-input"
              v-model="searchParams.areaId"
              :request-fn="getAllTreeAreaApi"
              filterable
              clearable
              @change="() => changeAreaId(searchParams)"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Thiết bị</div>
          <virtualized-select-from-url
              ref="machineRef"
              v-model="searchParams.machineId"
              :request-fn="() => getAllMachineApi({ areaId: searchParams.areaId })"
              filterable
              value-key="id"
              clearable
              class="filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Kiểu cảnh báo</div>
          <el-select v-model="searchParams.evaluationThresholdType" clearable placeholder="Tất cả" class="filter-input">
            <el-option :value="7" label="So với tốc độ tăng ΔPD% theo kỳ" />
            <el-option :value="8" label="So với ngưỡng cường độ PD" />
          </el-select>
        </div>
        <search-button @click="elTableRef?.refresh()"/>
        <export-button @click="() => exportFile(searchParams)" :loading="isExportLoading"></export-button>
      </div>
    </template>
  </list-template>
  <drawer-form
    v-model="detailVisible"
    v-loading="isLoading"
    :close-on-click-modal="true"
    :destroy-on-close="true"
    :size="isMobile ? '100%': '50%'"
    header-class="!m-0"
    body-class="!pt-0"
  >
    <notification-form-detail
        :form-model="formModel"
        @update-status="updateStatusSuccess"
    />
  </drawer-form>
</template>
