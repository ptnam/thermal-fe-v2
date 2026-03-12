<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue'
import {getAllTreeAreaApi} from '@/api/area'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import {ElButton, ElMessage} from 'element-plus'
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
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import NotificationFormDetail from '@/views/event/components/NotificationFormDetail.vue'
import useRequest from '@/hooks/web/useRequest'
import SearchButton from '@/components/Button/SearchButton.vue'
import ExportButton from '@/components/Button/ExportButton.vue'
import {
  createSignalRConnection,
  invokeSignalR,
  onSignalREvent,
  startSignalR,
  stopSignalR,
} from '@/plugins/signalr'
import {downloadByPathApi} from '@/api/common'
import {downloadFile} from '@/utils/response'
import {ElImage} from 'element-plus'

const {confirmModal} = useConfirmModal()

const changeStatus = (row: any) => {
  confirmModal('Cập nhật trạng thái', 'Bạn có chắc muốn cập nhật trạng thái đã xử lý?', () => {
    updateNotificationStatusApi(row.id, {
      status: row.statusObject.code === 'Pending' ? 2 : 1,
      dataTime: row.dataTime,
    }).then(() => {
      elTableRef?.value?.refresh()
    })
  })
}
const typeStatus = {
  Resolved: 'success',
  Pending: 'danger',
}
const columns = computed<TableColumn[]>(() => [
  {
    width: '120px',
    slots: {
      default: ({row}) => (
          <div>
            <ElButton
                type={typeStatus[row?.statusObject?.code]}
                circle
                onClick={() => changeStatus(row)}
                icon={Select}
            ></ElButton>
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
            {
              row.dataSourceType === 1 ? (
                  <img src={cameraImg} alt="sensor"/>
              ) : (
                  row.imagePath && (
                      <ElImage
                          src={row.imagePath}
                          lazy
                          fit="cover"
                          preview-src-list={[row.imagePath]}
                          show-progress
                          preview-teleported
                      />
                  )
              )
            }
          </div>
      ),
    },
  },
  {prop: 'dateData', label: 'Ngày', width: 120},
  {prop: 'timeData', label: 'Giờ'},
  {prop: 'areaName', label: 'Khu vực', width: 200},
  {prop: 'machineName', label: 'Thiết bị', width: 120},
  {prop: 'machineComponentName', label: 'Bộ phận', width: 120},
  {prop: 'monitorPointCode', label: 'Điểm nhiệt'},
  {
    prop: 'componentValue',
    label: 'Nhiệt độ',
    slots: {
      default: ({row}) => (<span style={{color: 'var(--danger)'}}>{row.componentValue}</span>)
    },
  },
  {prop: 'compareTypeObject.name', label: 'Kiểu cảnh báo', width: 160},
  {prop: 'warningEventName', label: 'Loại cảnh báo', width: 120},
  {prop: 'compareComponent', label: 'Đối tượng so sánh', width: 120},
  {prop: 'compareValue', label: 'Nhiệt độ so sánh'},
  {prop: 'deltaValue', label: 'Chênh lệch'},
  {prop: 'compareResultObject.name', label: 'Đánh giá'},
  {prop: 'statusObject.name', label: 'Trạng thái', width: 120},
  {prop: 'resolveTime', label: 'Thời gian xử lý', width: 140},
])

const machineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const changeAreaId = (searchParams: GenericObject) => {
  searchParams['machineId'] = null
  nextTick(() => {
    machineRef?.value?.fetch()
  })
}
const elTableRef = ref<InstanceType<typeof ListTemplate>>()

const formModel = ref<any>({
  id: null,
  compareResultObject: {},
  compareTypeObject: {},
  statusObject: {},
})
const {onRequest, isLoading} = useRequest()

const detailVisible = ref(false)
const openDetail = (row: any) => {
  detailVisible.value = true
  onRequest(notificationDetailApi, {id: row.id, dataTime: row.dataTime}).then((res) => {
    formModel.value = res.data
  })
}
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
    title="Danh sách Nhiệt độ vượt ngưỡng"
    key-list="notification-system"
    :columns="columns"
    :search-props="{ visibleSearchButton: false, inline: false }"
    :use-table-config="{
        fetchDataApi: listNotificationApi,
        searchDefaults: {
          fromTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00'),
        },
      }"
    :show-btn-add="false"
  >
    <template v-slot:top><span></span></template>
    <template slot="search" v-slot="{ searchParams }">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">Thời gian từ</div>
          <el-date-picker
            v-model="searchParams.fromTime"
            type="datetime"
            placeholder="Thời gian bắt đầu"
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
        <search-button @click="elTableRef?.refresh()"/>
        <export-button  @click="() => exportFile(searchParams)" :loading="isExportLoading"></export-button>
      </div>

    </template>
  </list-template>
  <base-dialog v-model="detailVisible" v-loading="isLoading" :close-on-click-modal="true">
    <notification-form-detail
      :form-model="formModel"
      @update-status="() => elTableRef?.refresh()"
    />
  </base-dialog>
</template>
