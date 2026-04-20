<template>
  <div>
    <list-template
        ref="elTableRef"
        key-list="user-list"
        :columns="tourCols"
        :use-table-config="{
                fetchDataApi: getTourList,
                searchDefaults: {cameraId: cameraId}
              }"
        :showSearchForm="false"
        @addHandler="addTour"
        :show-btn-switch="false"
    >
    </list-template>
    <ActionForm v-model="dialogVisible" :size="isMobile? '100%' : '50%'">
      <add-tour-form
          v-model:formModel="formModel"
          :title="formModel.id ? 'Cập nhật':'Thêm mới'"
          @success="handleSuccess"
      >
      </add-tour-form>
    </ActionForm>
  </div>
</template>
<script setup lang="tsx">
import {ElMessage, ElTag} from "element-plus";
import {useLang} from "@/hooks/web/useI18n";
import ApiButton from "@/components/Button/ApiButton.vue";
import EditCircleButton from "@/components/Button/EditCircleButton.vue";
import {ArrowRight, SwitchButton} from "@element-plus/icons-vue";
import {apiDeleteTour, getTourList, playTourApi} from "@/api/camera";
import { computed, ref} from 'vue'
import {useRoute} from "vue-router";
import DeleteCircleButton from "@/components/Button/DeleteCircleButton.vue";
import ActionForm from '@/components/Form/ActionForm.vue'
import AddTourForm from "@/views/category/camera/components/AddTourForm.vue";
import ListTemplate from "@/components/PageTemplate/List/ListTemplate.vue";
import { useAppStore } from '@/store/modules/app'


const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile)
const {t} = useLang()
const formModel = ref<any>({})
const route = useRoute()
const cameraId = route.params.id as string

const renderExpand = (scope: any) => {
  return (
      <div class="inline-block">
        {(scope.row.cameraTourPresets || []).map((item: any) => (
            <ElTag class="m-2" key={item.id} type="success" effect="dark">
              {item.name}({item.stayTime})
            </ElTag>
        ))}
      </div>
  )
}
const tourCols = [
  {prop: 'tourName', label: 'Tên'},
  {
    label: 'Góc quay',
    slots: {
      default: (scope: any) => renderExpand(scope)
    }
  },
  {
    prop: 'presetTypeObject.name',
    label: t('fields.action'),
    slots: {
      default: ({row}) => (
          <div>
            <ApiButton
                api={() => playTourApi({
                  tourId: row.tourId,
                  cameraId: row.cameraId,
                  command: 'run'
                }).then(res => showMessage(res))}
                icon={ArrowRight}
                color="#4F6B99"
                round={true}
            >
            </ApiButton>
            <ApiButton
                api={() => playTourApi({
                  tourId: row.tourId,
                  cameraId: row.cameraId,
                  command: 'stop'
                }).then(res => showMessage(res))}
                icon={SwitchButton}
                color="#FACE38"
                round={true}
            >
            </ApiButton>
            <EditCircleButton onClick={() => openDialogEdit(row)} />
            <DeleteCircleButton onClick={() => openDelete(row)}/>
          </div>
      ),
    },
  },
]
const elTableRef = ref<InstanceType<typeof ListTemplate>>()
const dialogVisible = ref(false)

const openDialogEdit = (row: any) => {
  formModel.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}
const openDelete = (row: any) => {
  elTableRef?.value?.deleteRow(() => apiDeleteTour({
    cameraId: cameraId,
    id: row.id
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
    cameraId: cameraId,
    tourName: '',
    cameraTourPresets: [],
  }
  dialogVisible.value = true
}

const handleSuccess = () => {
  elTableRef?.value?.getList()
  dialogVisible.value = false
}
</script>