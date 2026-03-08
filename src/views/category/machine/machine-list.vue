<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import {computed, ref} from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import {STATUS_ACTIVE} from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'
import {deleteMachineApi, detailMachineApi, exportMonitorPointsApi, getMachineListApi} from '@/api/machine'
import {getAllTreeAreaApi} from '@/api/area'
import MachineForm from '@/views/category/machine/components/MachineForm.vue'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import {getAllMachineTypeApi} from '@/api/machine-type'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import SearchButton from "@/components/Button/SearchButton.vue";
import ExportButton from "@/components/Button/ExportButton.vue";
import {downloadFile} from "@/utils/response";
import useRequest from "@/hooks/web/useRequest";

const {t} = useLang()

const columns = computed<TableColumn[]>(() => [
  {type: 'index', label: 'STT', width: 60},
  {prop: 'area.name', label: 'Khu vực'},
  {prop: 'machineType.name', label: 'Loại thiết bị'},
  {prop: 'name', label: 'Tên thiết bị'},
  {prop: 'code', label: 'Mã thiết bị'},
  {
    prop: 'displayStatus',
    label: 'Trạng thái',
    slots: {
      default: ({row}) => (<span   style={{
        color:  row.status === 'Active' ? 'var(--success)' : 'var(--danger)'
      }}>{row?.displayStatus}</span>)
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
    dictMachineParts: {},
    status: STATUS_ACTIVE,
  }
  dialogVisible.value = true
}
const detailLoading = ref(false)
const openDialogEdit = (scope: any) => {
  detailLoading.value = true
  detailMachineApi(scope.row.id)
      .then((res) => {
        formModel.value = res.data
        dialogVisible.value = true
      })
      .finally(() => {
        detailLoading.value = false
      })
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteMachineApi, scope.row.id)
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}

const {onRequest: requestExport, isLoading: isLoadingExport} = useRequest()
const exportFile = (searchParams: any) => {
  requestExport(exportMonitorPointsApi, searchParams).then((res) => {
    downloadFile(res)
  })
}
</script>

<template>
  <page-container title="Danh sách thiết bị">
    <list-template
        ref="elTableRef"
        :search-props="{ visibleSearchButton: false }"
        key-list="machine-list"
        :columns="columns"
        :use-table-config="{
          fetchDataApi: getMachineListApi,
        }"
        @addHandler="openDialogAdd"
        v-loading="detailLoading"
        title="Danh sách thiết bị"
    >
      <template slot="search" v-slot="{ searchParams }">
        <div class="filter-item">
          <div class="filter-label">Thiết bị</div>
          <el-input class="filter-input" v-model="searchParams.name" clearable placeholder="Nhập tên thiết bị..."/>
        </div>
        <div class="filter-item">
          <div class="filter-label">Khu vực</div>
          <tree-select-remote
              v-model="searchParams.areaId"
              :request-fn="getAllTreeAreaApi"
              filterable
              clearable
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Loại thiết bị</div>
          <virtualized-select-from-url
              v-model="searchParams.machineTypeId"
              :request-fn="getAllMachineTypeApi"
              filterable
              clearable
              value-key="id"
          />
        </div>
        <div class="flex justify-center">
          <search-button @click="elTableRef?.refresh()"/>
          <export-button @click="() => exportFile(searchParams)" :loading="isLoadingExport"/>
        </div>
      </template>
    </list-template>
    <base-dialog
        v-model="dialogVisible"
        align-center
        :destroy-on-close="true"
        style="min-width: 900px"
    >
      <machine-form v-model:formModel="formModel" @success="saveSuccess"></machine-form>
    </base-dialog>
  </page-container>
</template>
