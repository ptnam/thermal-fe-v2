<template>
  <div class="container main-container">
    <div class="camera-setting">

      <el-tabs v-model="activeName" type="border-card" @tabChange="tabChange">
        <el-tab-pane label="Quản lý tour" name="1">
          <setting-tour></setting-tour>
        </el-tab-pane>
        <el-tab-pane label="Quản lý góc quay" name="2">
          <setting-preset @addPreset="startDraw"></setting-preset>
        </el-tab-pane>
        <el-tab-pane label="Live" name="3">
          <stream-control
              ref="streamRef"
              :stream-key="cameraId"
              :show-btn-back="false"
              @pointedClicked="pointedClicked"
          >
            <template v-slot:sidebar>
              <div class="mt-4 flex flex-col">
                <span class="text-sm">Điều khiển camera và chọn các điểm đo</span>

                <div class="mt-2">
                  <el-button :disabled="!points.length" type="primary" @click="openDialogThermalAreas">Lưu vùng đo
                  </el-button>
                  <el-button type="danger" @click="clearPoints">Xóa vùng đo</el-button>
                </div>
              </div>
              <div v-show="formModel.thermalAreas.length" class="mt-4">
                <div class="flex gap-2 justify-center items-center">
                  <span class="text-sm">Danh sách vùng đã đo</span>
                  <el-button type="primary" @click="openDialogPreset">Lưu Preset</el-button>
                </div>
                <div>
                  <base-table
                      class="mt-4"
                      :data="formModel.thermalAreas"
                      row-key="name"
                      :columns="thermalAreasColumns" v-draggable="dragOptions"/>
                </div>
              </div>
            </template>
          </stream-control>
        </el-tab-pane>
      </el-tabs>
      <base-dialog v-model="visibleDialogPreset">
        <el-form
            ref="presetFormRef"
            style="max-width: 600px"
            :model="formModel"
            status-icon
            :rules="formRules"
            label-width="auto"
            class="demo-ruleForm"
        >
          <el-form-item label="Tên Preset" prop="name">
            <el-input v-model="formModel.name" autocomplete="off"/>
          </el-form-item>
          <div class="flex justify-center">
            <el-form-item>
              <el-button :loading="saveLoading" type="primary" @click="savePreset">Lưu</el-button>
            </el-form-item>
          </div>
        </el-form>
      </base-dialog>
      <base-dialog v-model="visibleThermalArea">
        <el-form
            ref="ruleFormRef"
            style="max-width: 600px"
            :model="thermalAreaForm"
            status-icon
            :rules="formRules"
            label-width="auto"
            class="demo-ruleForm"
        >
          <el-form-item label="Tên vùng" prop="name">
            <el-input v-model="thermalAreaForm.name" autocomplete="off"/>
          </el-form-item>
          <div class="flex justify-center">
            <el-form-item>
              <el-button type="primary" @click="addThermalArea">Thêm vùng</el-button>
            </el-form-item>
          </div>
        </el-form>
      </base-dialog>
    </div>
  </div>
</template>
<script setup lang="tsx">
import {computed, ref} from 'vue'
import SettingTour from "@/views/category/camera/components/SettingTour.vue";
import SettingPreset from "@/views/category/camera/components/SettingPreset.vue";
import StreamControl from "@/components/Video/StreamControl.vue";
import {useRoute} from "vue-router";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {rule} from "@/utils/validate";
import {addPreset} from "@/api/camera";
import {BaseTable} from "@/components/Table";
import {vDraggable} from "@/components/Table/v-draggable";

const activeName = ref("1")

const route = useRoute()
const cameraId = route.params.id as string
const streamRef = ref();
const ruleFormRef = ref<FormInstance>()
const presetFormRef = ref<FormInstance>()
const formModel = ref<any>({
  "cameraId": cameraId,
  "name": "",
  "thermalAreas": []
});

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [rule('required', true, 'Tên preset')],
  }
  return rules
})

const thermalAreasColumns = [
  {prop: 'name', label: "Tên vùng"},
]
const arrayMoveInPlace = (array: any[], fromIndex: number, toIndex: number) => {
  const [movedItem] = array.splice(fromIndex, 1);
  array.splice(toIndex, 0, movedItem);
  return array;
}

const dragOptions = [
  {
    selector: "tbody", // add drag support for row
    handle: '.el-table__row',
    option: { // sortablejs's option
      animation: 150,
      onEnd: (evt: any) => {
        arrayMoveInPlace(formModel.value.thermalAreas, evt.oldIndex, evt.newIndex)
      },
    },
  },
];
const startDraw = () => {
  activeName.value = '3'
  setTimeout(() => {
    streamRef?.value?.startDrawing()
  }, 1000);
}

const tabChange = () => {
  if (activeName.value == '3') {
    setTimeout(() => {
      streamRef?.value?.startDrawing()
    }, 1000);
  }
}
const points = ref<any[]>([])
const pointedClicked = (pos: any[]) => {
  points.value = pos.map(i => ({...i}))
}

const clearPoints = () => {
  streamRef?.value?.clearAllPoint()
}

const visibleThermalArea = ref(false)
const thermalAreaForm = ref<any>({})
const openDialogThermalAreas = () => {
  thermalAreaForm.value = {
    "name": "",
    "points": points.value
  }
  visibleThermalArea.value = true;
}

const addThermalArea = () => {
  if (!ruleFormRef.value) return
  ruleFormRef?.value?.validate((valid) => {
    if (valid) {

      formModel.value.thermalAreas.push({
        ...thermalAreaForm.value
      })
      visibleThermalArea.value = true;
      clearPoints()
      visibleThermalArea.value = false;
    }
  })
}

const visibleDialogPreset = ref(false);
const openDialogPreset = () => {
  visibleDialogPreset.value = true;
}

const saveLoading = ref(false)
const savePreset = () => {
  if (!presetFormRef.value) return
  presetFormRef?.value?.validate((valid) => {
    if (valid) {
      saveLoading.value = true
      addPreset(formModel.value).then(() => {
        clearPoints()
        visibleDialogPreset.value = false
        ElMessage({
          message: 'Lưu thành công!',
          type: 'success',
        })
        formModel.value = {
          "cameraId": cameraId,
          "name": "",
          "thermalAreas": []
        }
      }).finally(() => {
        saveLoading.value = false
      })
    }
  })
}
</script>