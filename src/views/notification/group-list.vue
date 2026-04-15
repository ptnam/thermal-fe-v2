<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'
import {computed, nextTick, ref} from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import {STATUS_ACTIVE} from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import { deleteNotificationGroupApi, getNotificationGroupListApi} from '@/api/notification-group'
import NotificationGroupForm from '@/views/notification/components/NotificationGroupForm.vue'
import { getAllNotificationChannelApi} from '@/api/notification-channel'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import {getAllWarningEventApi} from '@/api/warning-event'
import {joinFieldValues} from '@/utils/stringUtils'
import {getAllTreeAreaApi} from '@/api/area'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import SearchButton from "@/components/Button/SearchButton.vue";
import GroupCard from "@/views/notification/components/GroupCard.vue";

const {t} = useLang()

const columns = computed<TableColumn[]>(() => [
  {label: 'STT', type: 'index', width: '60'},
  {prop: 'name', label: 'Bộ cảnh báo'},
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
  {
    prop: 'displayStatus',
    width: 140,
    label: t('fields.status'),
    slots: {
      default: ({row}) => (<span   style={{
        color: row.status === 'Active' ? 'var(--success)' : 'var(--danger)'
      }}>{row?.groupStatusObject?.name}</span>)
    },
  },
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
  elTableRef?.value?.deleteRow(deleteNotificationGroupApi, scope.row.id)
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
  <list-template
      title="Danh sách cảnh báo hệ thống"
      ref="elTableRef"
      key-list="group-list"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: getNotificationGroupListApi,
      }"
      :search-props="{
        className: ''
      }"
      @addHandler="openDialogAdd"
      :card-component="GroupCard"
      @edit="openDialogEdit"
      @delete="openDelete"
  >
    <template slot="search" v-slot="{ searchParams, tableMethods }">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">Bộ cảnh báo</div>
          <el-input v-model="searchParams.name" clearable class="filter-input" placeholder="Nhập tên bộ cảnh báo..."/>
        </div>
        <div class="filter-item">
          <div class="filter-label">Kênh cảnh báo</div>
          <virtualized-select-from-url
              :request-fn="getAllNotificationChannelApi"
              v-model="searchParams.notificationChannels"
              class="filter-input"
              clearable
              :filterable="true"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Sự kiện</div>
          <virtualized-select-from-url
              :request-fn="getAllWarningEventApi"
              v-model="searchParams.events"
              clearable
              class="filter-input"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Khu vực</div>
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
              class="filter-input"
          />
        </div>
        <search-button @click="tableMethods?.refresh()"/>
      </div>
    </template>
  </list-template>
  <base-dialog v-model="dialogVisible" :destroy-on-close="true">
    <notification-group-form
        v-model:formModel="formModel"
        @success="saveSuccess"
    ></notification-group-form>
  </base-dialog>
</template>
