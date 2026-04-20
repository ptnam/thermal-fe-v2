<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'
import {deleteUserApi, getUserListApi, syncTelegramChatIdApi} from '@/api/user'
import {computed, ref} from 'vue'
import UserForm from '@/views/category/user/components/UserForm.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {STATUS_ACTIVE} from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import {joinFieldValues} from "@/utils/stringUtils";
import ApiButton from '@/components/Button/ApiButton.vue'
import SearchButton from '@/components/Button/SearchButton.vue'
import ActionForm from '@/components/Form/ActionForm.vue'
import UserCard from "@/views/category/user/components/UserCard.vue";
import { useAppStore } from '@/store/modules/app'

const {t} = useLang()
const renderActionColumn = (scope: any) => {
  return (
      <div>
        <EditCircleButton onClick={() => openDialogEdit(scope)}/>
        <DeleteCircleButton onClick={() => openDelete(scope)}/>
      </div>
  )
}
const columns = computed<TableColumn[]>(() => [
  {prop: 'fullName', label: t('user_list.fullName')},
  {prop: 'email', label: t('fields.email')},
  {prop: 'phone', label: t('fields.phone')},
  {
    label: 'Khu vực',
    slots: {
      default: (scope: any) => (
          <span>{joinFieldValues(scope.row.areas, 'name')}</span>
      ),
    },
  },
  {
    prop: 'displayStatus',
    width: 140,
    label: t('fields.status'),
    slots: {
      default: ({row}) => (<span   style={{
        color: row.status === 'Active' ? 'var(--success)' : 'var(--danger)'
      }}>{row.displayStatus}</span>)
    },
  },
  {prop: 'createdAt', width: 160, label: t('fields.created_at')},
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

const formModel = ref({
  id: null,
  username: '',
  firstName: '',
  lastMiddleName: '',
  email: '',
  phone: '',
  password: '',
  status: STATUS_ACTIVE,
})

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
const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile)
</script>

<template>
  <list-template
      :title="t('user_list.title')"
      ref="elTableRef"
      key-list="user-list"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: getUserListApi,
      }"
      @addHandler="openDialogAdd"
      :search-props="{ visibleSearchButton: false, className: '' }"
      :cardComponent="UserCard"
      @edit="openDialogEdit"
      @delete="openDelete"
  >
    <template slot="search" v-slot="{ searchParams }">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">Trạng thái</div>
          <select-from-config
              class="filter-input"
              key-config="userStatusList"
              v-model="searchParams.userStatus"
              clearable
          ></select-from-config>
        </div>
        <div class="filter-item">
          <div class="filter-label">Tên</div>
          <el-input v-model="searchParams.name" clearable placeholder="Nhập tên người dùng..."/>
        </div>
        <div class="filter-item">
          <div class="filter-label">Email</div>
          <el-input v-model="searchParams.email" clearable placeholder="Nhập email..."/>
        </div>
        <div class="filter-item">
          <div class="filter-label">Telegram</div>
          <el-input v-model="searchParams.telegramUsername" clearable placeholder="Nhập Telegram ID..."/>
        </div>
        <search-button @click="elTableRef?.refresh()"/>
        <api-button
            :api="syncTelegramChatIdApi"
            class="btn-search" style="background: transparent; border: 1px solid var(--border); color: var(--text-main)"
        >
          ⟳ Đồng bộ Telegram
        </api-button>
      </div>
    </template>

  </list-template>
  <ActionForm v-model="dialogVisible" :size="isMobile? '100%': '50%'">
    <user-form
        v-model:formModel="formModel"
        :title="formModel.id ? 'Cập nhật người dùng': 'Thêm người dùng mới'"
        @success="saveSuccess"
    ></user-form>
  </ActionForm>
</template>

<style lang="scss" scoped></style>
