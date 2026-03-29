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
        @addHandler="addPreset"
        :show-btn-switch="false"
    >
    </list-template>
  </div>
</template>
<script setup lang="tsx">
import { ElTag} from "element-plus";
import {useLang} from "@/hooks/web/useI18n";
import {deletePreset, presetList} from "@/api/camera";
import {ref} from 'vue'
import {useRoute} from "vue-router";
import DeleteCircleButton from "@/components/Button/DeleteCircleButton.vue";
import ListTemplate from "@/components/PageTemplate/List/ListTemplate.vue";
import EditCircleButton from "@/components/Button/EditCircleButton.vue";


const {t} = useLang()
// const formModel = ref({})
const route = useRoute()
const cameraId = route.params.id as string

const renderExpand = (scope: any) => {
  return (
      <div class="inline-block">
        {(scope.row.cameraMonitorPoints || []).map((item: any) => (
            <ElTag class="m-2" key={item.id} type="success" effect="dark">
              {item.name}
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
  {
    label: t('fields.action'),
    slots: {
      default: ({row}) => (
          <div>
            <DeleteCircleButton onClick={() => openDelete(row)}/>
            <EditCircleButton onClick={() => emits('edit', row)}/>
          </div>
      ),
    },
  },
]
const elTableRef = ref<InstanceType<typeof ListTemplate>>()
// const dialogVisible = ref(false)

const openDelete = (row: any) => {
  elTableRef?.value?.deleteRow(() => deletePreset(row.presetId, {
    "cameraId": cameraId,
    "presetId": row.presetId
  }))
}
// const showMessage = (res: any) => {
//   ElMessage({
//     message: res.message,
//     type: 'success',
//   })
// }

const emits = defineEmits(['addPreset', 'edit'])
const addPreset = () => {
  emits("addPreset")
}
</script>