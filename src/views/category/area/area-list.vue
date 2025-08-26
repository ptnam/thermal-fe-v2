<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import { TableColumn } from '@/components/Table'
import { useLang } from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import { deleteAreaApi, getAreaListApi } from '@/api/area'
import { computed, ref } from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import AreaForm from '@/views/category/area/components/AreaForm.vue'
import { STATUS_ACTIVE } from '@/constants'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'

const { t } = useLang()
const renderActionColumn = (scope: any) => {
  return (
    <div>
      <EditCircleButton onClick={() => openDialogEdit(scope)}></EditCircleButton>
      <DeleteCircleButton onClick={() => openDelete(scope)}></DeleteCircleButton>
    </div>
  )
}
const columns = computed<TableColumn[]>(() => [
  { prop: 'code', label: 'Mã khu vực' },
  { prop: 'name', label: 'Tên khu vực' },
  { prop: 'mapTypeObject.name', label: 'Loại bản đồ' },
  { prop: 'note', label: 'Ghi chú' },
  { prop: 'displayStatus', width: 140, label: t('fields.status') },
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
    mapType: 'Map',
    parentId: null,
    status: STATUS_ACTIVE,
  }
  dialogVisible.value = true
}
const openDialogEdit = (scope: any) => {
  formModel.value = JSON.parse(JSON.stringify(scope.row))
  dialogVisible.value = true
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteAreaApi, scope.row.id)
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}
</script>

<template>
  <page-container title="Danh sách khu vực">
    <list-template
      ref="elTableRef"
      key-list="area-list"
      :columns="columns"
      :use-table-config="{
        fetchDataApi: getAreaListApi,
      }"
      :row-key="(row: any) => row.id"
      :default-expand-all="false"
      @addHandler="openDialogAdd"
      :tree-props="{ children: 'children', checkStrictly: true }"
    >
      <template slot="search" v-slot="{ searchParams }">
        <el-form-item label="Tên khu vực" label-width="100px">
          <el-input v-model="searchParams.name" clearable />
        </el-form-item>
        <el-form-item :label="t('fields.status')" label-width="80px">
          <select-from-config
            style="width: 180px"
            key-config="userStatusList"
            v-model="searchParams.status"
            clearable
          ></select-from-config>
        </el-form-item>
      </template>
    </list-template>
    <base-dialog v-model="dialogVisible" :destroy-on-close="true" style="min-width: 650px">
      <area-form v-model:formModel="formModel" @success="saveSuccess"></area-form>
    </base-dialog>
  </page-container>
</template>
