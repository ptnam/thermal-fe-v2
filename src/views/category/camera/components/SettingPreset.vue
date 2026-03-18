<template>
  <div>
    <list-template
        ref="elTableRef"
        key-list="user-list"
        :columns="tourCols"
        :use-table-config="{
                fetchDataApi: presetList,
                searchDefaults: {cameraId: cameraId}
              }"
        :showSearchForm="false"
        @addHandler="addTour"
        :show-btn-switch="false"
    >
    </list-template>
    <ActionForm v-model="dialogVisible" style="min-width: 500px">
      <add-tour-form
          v-model:formModel="formModel"
          title="Thêm mới"
          @success="saveSuccess">
      </add-tour-form>
    </ActionForm>
  </div>
</template>
<script setup lang="tsx">
import {ElMessage, ElTag} from "element-plus";
import {useLang} from "@/hooks/web/useI18n";
import ApiButton from "@/components/Button/ApiButton.vue";
import {ArrowRight, SwitchButton} from "@element-plus/icons-vue";
import {apiDeleteTour, deletePreset, getTourList, playTourApi, presetList} from "@/api/camera";
import {ref} from 'vue'
import {useRoute} from "vue-router";
import DeleteCircleButton from "@/components/Button/DeleteCircleButton.vue";
import ActionForm from '@/components/Form/ActionForm.vue'
import AddTourForm from "@/views/category/camera/components/AddTourForm.vue";
import ListTemplate from "@/components/PageTemplate/List/ListTemplate.vue";


const {t} = useLang()
const formModel = ref({})
const route = useRoute()
const cameraId = route.params.id as string

const renderExpand = (scope: any) => {
  return (
      <div class="inline-block">
        {(scope.row.cameraTourPresets || []).map((item: any) => (
            <ElTag class="m-2" key={item.id} type="success" effect="dark">
              {item.name}({item.time})
            </ElTag>
        ))}
      </div>
  )
}
const tourCols = [
  {prop: 'name', label: 'Tên'},
  {
    label: 'Điểm đo',
    slots: {
      default: (scope: any) => renderExpand(scope)
    }
  },
  {prop: 'presetTypeObject.name', label: 'Loại'},
  {
    label: t('fields.action'),
    slots: {
      default: ({row}) => (
          <div>
            <DeleteCircleButton onClick={() => openDelete(row)}/>
          </div>
      ),
    },
  },
]
const elTableRef = ref<InstanceType<typeof ListTemplate>>()
const dialogVisible = ref(false)

const openDelete = (row: any) => {
  elTableRef?.value?.deleteRow(() => deletePreset(row.presetId, {
    "cameraId": cameraId,
    "presetId": row.presetId
  }))
}
const showMessage = (res: any) => {
  ElMessage({
    message: res.message,
    type: 'success',
  })
}
const addTour = () => {
  formModel.value = {
    tourName: '',
    cameraTourPoints: [],
  }
  dialogVisible.value = true
}
</script>