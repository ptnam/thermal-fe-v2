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
import {getAllMachineTypeApi} from '@/api/machine-type'

import {deleteMachinePartApi, detailMachinePartApi, getMachinePartListApi} from '@/api/machine-part'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import {useRoute} from 'vue-router'
import AddButton from '@/components/Button/AddButton.vue'
import MachinePartForm from '@/views/category/machine-part/components/MachinePartForm.vue'
import BackButton from "@/components/Button/BackButton.vue";

const {t} = useLang()

const columns = computed<TableColumn[]>(() => [
  {prop: 'name', label: 'Tên'},
  {prop: 'code', label: 'Mã'},
  {prop: 'statusObject.name', width: 140, label: t('fields.status')},
  {prop: 'createdAt', width: 160, label: t('fields.created_at')},
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

const route = useRoute()

const machineTypeValue = ref(parseInt(route.params.machineTypeId as string))
const openDialogAdd = () => {
  formModel.value = {
    machineTypeId: machineTypeValue,
    status: STATUS_ACTIVE,
    machinePartThresholdList: []
  }
  dialogVisible.value = true
}
const detailLoading = ref(false)
const openDialogEdit = (scope: any) => {
  detailLoading.value = true
  detailMachinePartApi(scope.row.id)
      .then((res) => {
        formModel.value = res.data
        dialogVisible.value = true
      })
      .finally(() => {
        detailLoading.value = false
      })
}

const openDelete = (scope: any) => {
  elTableRef?.value?.deleteRow(deleteMachinePartApi, scope.row.id)
}

const saveSuccess = () => {
  elTableRef?.value?.refresh()
  dialogVisible.value = false
}
</script>

<template>
  <page-container title="Danh sách bộ phận của thiết bị">
    <list-template
        ref="elTableRef"
        key-list="machine-part-list"
        :row-key="(row: any) => row.id"
        :default-expand-all="true"
        :tree-props="{ children: 'children', checkStrictly: true }"
        :columns="columns"
        :show-search-form="false"
        :use-table-config="{
          fetchDataApi: () => getMachinePartListApi({ machineTypeId: machineTypeValue })
        }"
        v-loading="detailLoading"
    >
      <template v-slot:top>
        <div class="flex justify-between">
          <el-form-item label="Loại thiết bị">
            <VirtualizedSelectFromUrl
                v-model="machineTypeValue"
                :request-fn="getAllMachineTypeApi"
                style="width: 200px"
                :disabled="true"
                clearable
            />
          </el-form-item>
          <div>
            <back-button default-path="/category/machine-type"></back-button>
            <add-button :disabled="!machineTypeValue" @click="openDialogAdd"></add-button>
          </div>
        </div>
      </template>
    </list-template>
    <base-dialog v-model="dialogVisible" :destroy-on-close="true" style="min-width: 500px">
      <MachinePartForm v-model:formModel="formModel" @success="saveSuccess"></MachinePartForm>
    </base-dialog>
  </page-container>
</template>
