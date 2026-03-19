<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import {computed, ref} from 'vue'
import {STATUS_ACTIVE} from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import MachineTypeForm from '@/views/category/machine-type/components/MachineTypeForm.vue'
import {deleteMachineTypeApi, getMachineTypeListApi} from '@/api/machine-type'
import {ElButton} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import {useRouter} from 'vue-router'
import SearchButton from '@/components/Button/SearchButton.vue'
import DrawerForm from "@/components/Form/DrawerForm.vue";

const {t} = useLang()
const router = useRouter()

const columns = computed<TableColumn[]>(() => [
  {prop: 'code', label: 'Mã loại thiết bị'},
  {prop: 'name', label: 'Tên loại thiết bị'},
  {prop: 'statusObject.name', width: 140, label: t('fields.status')},
  {prop: 'createdAt', width: 160, label: t('fields.created_at')},
  {
    label: t('fields.action'),
    width: '280px',
    slots: {
      default: (scope: any) => (
          <div>
            <ElButton type="primary" icon={Plus} onClick={() => addMachinePart(scope)}>
              Bộ phận
            </ElButton>
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
  dialogVisible.value = true
}
const openDialogEdit = (scope: any) => {
  formModel.value = JSON.parse(JSON.stringify(scope.row))
  dialogVisible.value = true
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteMachineTypeApi, scope.row.id)
}

const addMachinePart = (scope: any) => {
  router.push({name: 'machine_part', params: {machineTypeId: scope.row.id}, query: {  name: scope.row.mame }})
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}
</script>

<template>
  <page-container title="Danh sách loại thiết bị">
    <list-template
        ref="elTableRef"
        key-list="machine-type-list"
        :columns="columns"
        :use-table-config="{
        fetchDataApi: getMachineTypeListApi,
      }"
        @addHandler="openDialogAdd"
        :search-props="{
        className: ''
      }"
    >
      <template slot="search" v-slot="{ searchParams, tableMethods }">
        <div class="filter-row">
          <div class="filter-item">
            <div class="filter-label">Tên</div>
            <el-input v-model="searchParams.name" class="filter-input" placeholder="Nhập tên loại thiết bị..." clearable/>
          </div>
          <search-button @click="tableMethods.getList"></search-button>
        </div>
      </template>
    </list-template>
    <drawer-form v-model="dialogVisible" :destroy-on-close="true">
      <MachineTypeForm :formModel="formModel" @success="saveSuccess"></MachineTypeForm>
    </drawer-form>
  </page-container>
</template>

<style lang="scss" scoped></style>
