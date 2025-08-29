<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import { TableColumn } from '@/components/Table'
import { useLang } from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import { deleteUserApi, getUserListApi, syncTelegramChatIdApi } from '@/api/user'
import { computed, ref } from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import UserForm from '@/views/category/user/components/UserForm.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import { STATUS_ACTIVE } from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import {joinFieldValues} from "@/utils/stringUtils";
import ApiButton from '@/components/Button/ApiButton.vue'
import { Refresh } from '@element-plus/icons-vue'
import SearchButton from '@/components/Button/SearchButton.vue'

const { t } = useLang()
const renderActionColumn = (scope: any) => {
  return (
    <div>
      <EditCircleButton onClick={() => openDialogEdit(scope)} />
      <DeleteCircleButton onClick={() => openDelete(scope)} />
    </div>
  )
}
const columns = computed<TableColumn[]>(() => [
  { prop: 'fullName', label: t('user_list.fullName') },
  { prop: 'email', label: t('fields.email') },
  { prop: 'phone', label: t('fields.phone') },
  {
    label: 'Khu vực',
    slots: {
      default: (scope: any) => (
          <span>{joinFieldValues(scope.row.areas, 'name')}</span>
      ),
    },
  },
  { prop: 'displayStatus', width: 140, label: t('fields.status') },
  { prop: 'createdAt', width: 160, label: t('fields.created_at') },
  {
    label: t('fields.action'),
    width: '110px',
    slots: {
      default: renderActionColumn,
    },
  },
])
const dialogVisible = ref(false)
const elTableRef = ref<InstanceType<typeof ListTemplate>>()

const formModel = ref({})

const openDialogAdd = () => {
  formModel.value = {
    username: '',
    firstName: '',
    lastMiddleName: '',
    email: '',
    phone: '',
    password: '',
    status: STATUS_ACTIVE,
  }
  dialogVisible.value = true
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
</script>

<template>
  <page-container :title="t('user_list.title')">
    <list-template
      ref="elTableRef"
      key-list="user-list"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: getUserListApi,
      }"
      @addHandler="openDialogAdd"
      :search-props="{ visibleSearchButton: false }"
    >
      <template v-slot:top><span></span></template>
      <template slot="search" v-slot="{ searchParams }">
        <el-form-item :label="t('fields.status')">
          <select-from-config
            style="width: 160px"
            key-config="userStatusList"
            v-model="searchParams.userStatus"
            clearable
          ></select-from-config>
        </el-form-item>
        <el-form-item label="Tên">
          <el-input v-model="searchParams.name" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="searchParams.email" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="Telegram">
          <el-input v-model="searchParams.telegramUsername" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <search-button @click="elTableRef?.refresh()" />
          <api-button
            :api="syncTelegramChatIdApi"
            :icon="Refresh"
          >
            Đồng bộ telegram
          </api-button>
        </el-form-item>
      </template>

    </list-template>
    <base-dialog v-model="dialogVisible" :destroy-on-close="true">
      <user-form v-model:formModel="formModel" @success="saveSuccess"></user-form>
    </base-dialog>
  </page-container>
</template>

<style lang="scss" scoped></style>
