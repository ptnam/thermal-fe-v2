<template>
  <div>
    <h2 class="font-bold">Thay đổi thứ tự hiển thị của camera</h2>
    <h6>Kéo và thả dòng cần thay đổi tới nơi mới</h6>
    <base-table class="mt-4" :data="tableData" :columns="columns" v-draggable="dragOptions"/>
    <div class="mt-4 flex gap-2 justify-center">
      <cancel-button @click="emits('closeDialog')"></cancel-button>
      <save-button @click="save" :loading="saveLoading"></save-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {BaseTable} from "@/components/Table";
import {vDraggable} from "@/components/Table/v-draggable";
import SaveButton from "@/components/Button/SaveButton.vue";
import CancelButton from "@/components/Button/CancelButton.vue";
import {updateCameraSettingApi} from "@/api/camera-setting";
import {CAMERA_COMMANDS} from "@/constants";
import {ref} from "vue";

const emits = defineEmits(['closeDialog', 'updateCamSetting'])

const props = defineProps({
  tableData: {
    type: Array,
    required: true
  },
})

const arrayMoveInPlace = (array: any[], fromIndex: number, toIndex: number) => {
  const [movedItem] = array.splice(fromIndex, 1);
  array.splice(toIndex, 0, movedItem);
  return array;
}
const saveLoading = ref(false)

const dragOptions = [
  {
    selector: "tbody", // add drag support for row
    handle: '.el-table__row',
    option: { // sortablejs's option
      animation: 150,
      onEnd: (evt: any) => {
        arrayMoveInPlace(props.tableData, evt.oldIndex, evt.newIndex)
      },
    },
  },
];

const columns = [
  {prop: 'id', label: "ID"},
  {prop: 'code', label: "Mã camera"},
  {prop: 'name', label: "Tên camera"},
  {prop: 'deviceStatusObject.name', label: 'Trạng thái', width: '150px'},
];

const save = () => {
  saveLoading.value = true
  updateCameraSettingApi({
    flagCommand: CAMERA_COMMANDS.ALL,
    cameraIds: (props.tableData as Array<{ id: number }>).map(item => item.id)
  }).then((res) => {
    emits("updateCamSetting", res.data)
  }).finally(() => {
    saveLoading.value = false
    emits("closeDialog")
  })
}

</script>