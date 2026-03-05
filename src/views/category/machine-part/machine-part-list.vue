<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import {TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'
import PageContainer from '@/components/PageContainer.vue'
import {computed, onMounted, ref} from 'vue'
import BaseDialog from '@/components/Dialog/BaseDialog.vue'
import {STATUS_ACTIVE} from '@/constants'
import DeleteCircleButton from '@/components/Button/DeleteCircleButton.vue'
import EditCircleButton from '@/components/Button/EditCircleButton.vue'

import {deleteMachinePartApi, detailMachinePartApi, getMachinePartListApi} from '@/api/machine-part'
import {useRoute} from 'vue-router'
import MachinePartForm from '@/views/category/machine-part/components/MachinePartForm.vue'
import BackButton from "@/components/Button/BackButton.vue";
import { getDetailMachineTypeApi } from '@/api/machine-type'

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
const machineNameValue = ref("")
 onMounted(() => {
   getDetailMachineTypeApi(machineTypeValue.value).then(res => {
     machineNameValue.value = res.data.name
   })
 })
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
  <page-container >
    <list-template
        ref="elTableRef"
        title="Danh sách bộ phận của thiết bị"
        key-list="machine-part-list"
        :row-key="(row: any) => row.id"
        :default-expand-all="true"
        :tree-props="{ children: 'children', checkStrictly: true }"
        :columns="columns"
        :show-search-form="false"
        :use-table-config="{
          fetchDataApi: () => getMachinePartListApi({ machineTypeId: machineTypeValue })
        }"
        @addHandler="openDialogAdd"
        v-loading="detailLoading"
    >
      <template v-slot:top>
        <div style="padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border)">
          <div>
            <div style="font-size: 16px; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 4px;">
              Danh sách bộ phận</div>
            <div style="font-size: 12px; color: var(--text-sub);">Loại thiết bị: <span style="font-weight: 600; color: var(--text-main);">{{ machineNameValue}}</span></div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <back-button default-path="/category/machine-type"></back-button>

            <button  :disabled="!machineTypeValue" @click="openDialogAdd" class="btn-add" style="margin: 0;">+ Thêm bộ phận</button>
          </div>
        </div>
      </template>
    </list-template>
    <base-dialog v-model="dialogVisible" :destroy-on-close="true" style="min-width: 500px">
      <MachinePartForm v-model:formModel="formModel" @success="saveSuccess"></MachinePartForm>
    </base-dialog>
  </page-container>
</template>
