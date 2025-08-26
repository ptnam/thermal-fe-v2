<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import {computed, ref} from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {STATUS_ACTIVE,} from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import {deleteNotificationChannelApi, getNotificationChannelListApi,} from '@/api/notification-channel'
import NotificationChannelForm from '@/views/notification/components/NotificationChannelForm.vue'
import {getUserListApi} from '@/api/user'
import InfiniteSelect from '@/components/Selection/InfiniteSelect.vue'
import {joinFieldValues} from '@/utils/stringUtils'

const {t} = useLang()

const columns = computed<TableColumn[]>(() => [
  {label: 'STT', type: 'index', width: '60'},
  {prop: 'name', label: 'Tên cảnh báo'},
  {prop: 'channelType', label: 'Loại cảnh báo'},
  {
    label: 'Người dùng',
    slots: {
      default: (scope: any) => <span>{joinFieldValues(scope.row.users, 'firstName')}</span>,
    },
  },
  {prop: 'displayStatus', label: 'Trạng thái'},
  {prop: 'createdAt', label: 'Ngày tạo'},
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
    name: '',
    status: STATUS_ACTIVE,
  }
  dialogVisible.value = true
}
const openDialogEdit = (scope: any) => {
  formModel.value = JSON.parse(JSON.stringify(scope.row))
  dialogVisible.value = true
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteNotificationChannelApi, scope.row.id)
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}
</script>

<template>
  <page-container title="Danh sách cảnh báo">
    <list-template
        ref="elTableRef"
        key-list="channel-list"
        :columns="columns"
        :use-table-config="{
        fetchDataApi: getNotificationChannelListApi,
      }"
        @addHandler="openDialogAdd"
    >
      <template slot="search" v-slot="{ searchParams }">
        <el-form-item label="Tên kênh" label-width="80px">
          <el-input v-model="searchParams.name" clearable style="width: 160px"/>
        </el-form-item>
        <el-form-item label="Nơi nhận cảnh báo" prop="channelType">
          <select-from-config
              style="width: 160px"
              key-config="notificationChannelTypeList"
              v-model="searchParams.channelType"
              col-value="code"
              col-label="name"
              clearable
          ></select-from-config>
        </el-form-item>
        <el-form-item
            label="Email"
            label-width="50px"
        >
          <el-input v-model="searchParams.email" clearable style="width: 160px"/>
        </el-form-item>
        <el-form-item
            label="Người dùng"
            prop="formModel.users"
            label-width="95px"
        >
          <InfiniteSelect
              v-model="searchParams.userId"
              :request-fn="getUserListApi"
              :append-query="{ status: STATUS_ACTIVE }"
              col-value="id"
              col-label="fullName"
              clearable
              style="min-width: 240px"
          />
        </el-form-item>
      </template>
    </list-template>
    <base-dialog v-model="dialogVisible" :destroy-on-close="true" style="min-width: 500px">
      <NotificationChannelForm
          :formModel="formModel"
          @success="saveSuccess"
      ></NotificationChannelForm>
    </base-dialog>
  </page-container>
</template>
