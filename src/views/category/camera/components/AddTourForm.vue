<template>
  <FormWrapper :form-model="formModel" :form-props="{ labelWidth: '140px', rules: formRules }"
               :request-fn="addTour" :isEditing="isEditing" @success="handleSuccess">
    <template v-slot="{ formErrors }">
      <el-form-item label="Tên" prop="tourName" :error="formErrors.TourName">
        <el-input v-model="formModel.tourName"/>
      </el-form-item>
      <el-form-item label="Góc quay " prop="cameraTourPresets" :error="formErrors.Name">
        <object-infinite-select
            :request-fn="presetList"
            :appendQuery="{cameraId: cameraId}"
            v-model="formModel.cameraTourPresets"
            multiple
            filterable placeholder="Chọn điểm tour"
        ></object-infinite-select>
      </el-form-item>
      <base-table :data="formModel.cameraTourPresets" :columns="tourPointColumns"></base-table>
    </template>
  </FormWrapper>
</template>

<script setup lang="tsx">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import {computed} from 'vue'
import {rule} from '@/utils/validate'
import {isFormEditing} from '@/utils/is'
import {FormRules, ElInput} from 'element-plus'
import {BaseTable} from "@/components/Table";
import ObjectInfiniteSelect from "@/components/Selection/ObjectInfiniteSelect.vue";
import {addTour, presetList} from "@/api/camera";
import {useRoute} from "vue-router";

const formModel = defineModel<any>('formModel')
const route = useRoute()
const cameraId = route.params.id as string
const tourPointColumns = [
  {prop: 'name', label: 'Tên Góc quay'},
  {
    label: 'Thời gian dừng',
    slots: {
      default: (scope: any) => (
          <ElInput
              modelValue={scope.row.stayTime}
              placeholder="Nhập thời gian dừng tại điểm tour (giây)"
              onUpdate:modelValue={(val: string) => {
                scope.row.stayTime = val
              }}
          />
      )
    }
  },
]

const isEditing = computed(() => {
  return isFormEditing(formModel.value)
})
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    tourName: [rule('required', true, 'Tên tour '), rule('min', 3, 'username')],
  }
  return rules
})
const emit = defineEmits<(e: 'success', data: any) => void>()
const handleSuccess = (data: any) => {
  emit('success', data)
}
</script>
