<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import { TableColumn } from '@/components/Table'
import { useLang } from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import { deleteUserApi } from '@/api/user'
import { computed, nextTick, ref } from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import { STATUS_ACTIVE } from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import { getNotificationGroupListApi } from '@/api/notification-group'
import NotificationGroupForm from '@/views/notification/components/NotificationGroupForm.vue'
import { getAllNotificationChannelApi } from '@/api/notification-channel'
import { getAllCamerasApi } from '@/api/camera'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import { getAllWarningEventApi } from '@/api/warning-event'
import { joinFieldValues } from '@/utils/stringUtils'
import { getAllTreeAreaApi } from '@/api/area'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'

const { t } = useLang()

const columns = computed<TableColumn[]>(() => [
  { label: 'STT', type: 'index', width: '60' },
  { prop: 'name', label: 'Bộ cảnh báo' },
  {
    label: 'Kênh cảnh báo',
    prop: 'notificationChannels',
    slots: {
      default: (scope: any) => (
        <span>{joinFieldValues(scope.row.notificationChannels, 'name')}</span>
      ),
    },
  },
  {
    label: 'Sự kiện',
    prop: 'events',
    slots: {
      default: (scope: any) => <span>{joinFieldValues(scope.row.events, 'name')}</span>,
    },
  },
  { prop: 'groupStatusObject.name', label: 'Trạng thái' },
  {
    label: t('fields.action'),
    width: '110px',
    slots: {
      default: (scope: any) => (
        <div>
          <EditCircleButton onClick={() => openDialogEdit(scope)}></EditCircleButton>
          <DeleteCircleButton onClick={() => openDelete(scope)}></DeleteCircleButton>
        </div>
      ),
    },
  },
])
const dialogVisible = ref(false)
const elTableRef = ref<InstanceType<typeof ListTemplate>>()

const formModel = ref({})

const openDialogAdd = () => {
  formModel.value = {
    status: STATUS_ACTIVE,
  }
  nextTick(() => {
    dialogVisible.value = true
  })
}
const openDialogEdit = (scope: any) => {
  formModel.value = JSON.parse(JSON.stringify(scope.row))
  dialogVisible.value = true
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteUserApi, scope.row.id)
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}
const cameraRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const changeAreaId = (searchParams: GenericObject) => {
  searchParams['cameras'] = null
  cameraRef?.value?.fetch()
}
</script>

<template>
  <page-container title="Danh sách cảnh báo hệ thống">
    <list-template
      ref="elTableRef"
      key-list="group-list"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: getNotificationGroupListApi,
      }"
      @addHandler="openDialogAdd"
    >
      <template slot="search" v-slot="{ searchParams }">
        <el-form-item label="Bộ cảnh báo" label-width="100px">
          <el-input v-model="searchParams.name" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="Kênh cảnh báo">
          <virtualized-select-from-url
            :request-fn="getAllNotificationChannelApi"
            v-model="searchParams.notificationChannels"
            style="width: 160px"
            clearable
            :filterable="true"
          />
        </el-form-item>
        <el-form-item label="Sự kiện" label-width="70px">
          <virtualized-select-from-url
            :request-fn="getAllWarningEventApi"
            v-model="searchParams.events"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="Khu vực" label-width="70px">
          <tree-select-remote
            v-model="searchParams.areaId"
            :request-fn="getAllTreeAreaApi"
            filterable
            clearable
            @change="
              () => {
                changeAreaId(searchParams)
              }
            "
          />
        </el-form-item>
        <el-form-item v-if="searchParams.areaId" label="Camera" label-width="60">
          <virtualized-select-from-url
            ref="cameraRef"
            v-model="searchParams.cameras"
            :request-fn="() => getAllCamerasApi({ areaId: searchParams.areaId })"
            filterable
            clearable
            value-key="id"
            style="width: 160px"
          />
        </el-form-item>
      </template>
    </list-template>
    <base-dialog v-model="dialogVisible" :destroy-on-close="true">
      <notification-group-form
        v-model:formModel="formModel"
        @success="saveSuccess"
      ></notification-group-form>
    </base-dialog>
  </page-container>
</template>
