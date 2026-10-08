<script setup lang="tsx">
import { enumLabel } from '@/utils/enumLabel'
import { useLang } from '@/hooks/web/useI18n'
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
import NotificationSystemCard from '@/views/event/components/NotificationSystemCard.vue'
import { useAppStore } from '@/store/modules/app'

const { t } = useLang()

const {confirmModal} = useConfirmModal()

// listNotificationApi trả cả cảnh báo PD nếu không lọc - khoá cứng warningEventCode như pd-notification-system.vue.
const THERMAL_WARNING_EVENT_CODE = 'OVERTHERMAL'

const changeStatus = (row: any) => {
  confirmModal(t('alert.updateStatus'), t('alert.updateStatusConfirm'), () => {
    updateNotificationStatusApi(row.id, {
      status: row.statusObject.code === 'Pending' ? 2 : 1,
      dataTime: row.dataTime,
    }).then(() => {
      ElMessage({
        message: t('common.saveSuccess'),
        type: 'success',
      })
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
    label: t('alert.image'),
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
  {prop: 'dateData', label: t('alert.date'), width: 120},
  {prop: 'timeData', label: t('alert.hour'), width: 120},
  {prop: 'areaName', label: t('fields.area'), minWidth: 250},
  {prop: 'machineName', label: t('alert.equipment'), width: 120},
  {prop: 'machineComponentName', label: t('alert.component'), width: 120},
  {prop: 'monitorPointCode', label: t('alert.thermalPoint'),  width: 120},
  {
    prop: 'componentValue',
    label: t('alert.temperature'),
    width: 120,
    slots: {
      default: ({row}) => (<span style={{color: 'var(--danger)'}}>{row.componentValue}</span>)
    },
  },
  {prop: 'compareTypeObject.name', label: t('alert.alertMode'), width: 200},
  {prop: 'warningEventName', label: t('alert.alertType'), width: 120},
  {prop: 'compareComponent', label: t('alert.compareObject'), width: 160},
  {prop: 'compareValue', label: t('alert.compareTemperature'), width: 160},
  {prop: 'deltaValue', label: t('alert.delta'), width: 120},
  {prop: 'compareResultObject.name', label: t('alert.evaluation'), width: 100},
  {prop: 'statusObject.name', label: t('fields.status'), width: 120,
    formatter: (row: any) => enumLabel('notificationStatusList', row.statusObject?.code, row.statusObject?.name)},
  {prop: 'resolveTime', label: t('alert.resolveTime'), width: 140},
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

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile)
const openDetail = (row: any) => {
  detailVisible.value = true
  onRequest(notificationDetailApi, {id: row.id, dataTime: row.dataTime}).then((res) => {
    formModel.value = res.data
  })
}
const updateStatusSuccess = () => {
  detailVisible.value = false;
  ElMessage({
    message: t('common.saveSuccess'),
    type: 'success',
  })
  elTableRef?.value?.refresh()
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
    ElMessage.success(t('alert.exportStarted'))
  })
}
</script>

<template>
  <list-template
      ref="elTableRef"
      :title="t('alert.overTempTitle')"
      key-list="notification-system"
      :columns="columns"
      :search-props="{ visibleSearchButton: false, inline: false, className:'' }"
      :use-table-config="{
        fetchDataApi: listNotificationApi,
        searchDefaults: {
          fromTime: dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00'),
          warningEventCode: THERMAL_WARNING_EVENT_CODE,
        },
      }"
      :show-btn-add="false"
      :card-component="NotificationSystemCard"
  >
    <template slot="search" v-slot="{ searchParams }">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">{{ t('alert.timeFrom') }}</div>
          <el-date-picker
              v-model="searchParams.fromTime"
              type="datetime"
              :placeholder="t('alert.startTime')"
              format="YYYY/MM/DD hh:mm:ss A"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ t('alert.timeTo') }}</div>
          <el-date-picker
              v-model="searchParams.toTime"
              type="datetime"
              :placeholder="t('alert.endTime')"
              format="YYYY/MM/DD hh:mm:ss A"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-[-webkit-fill-available] filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">{{ t('fields.area') }}</div>
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
          <div class="filter-label">{{ t('alert.equipment') }}</div>
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
