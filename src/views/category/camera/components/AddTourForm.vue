<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '140px', rules: formRules }"
      :request-fn="addTour"
      :isEditing="false"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <el-form-item :label="t('fields.name')" prop="tourName" :error="formErrors.TourName">
        <el-input v-model="formModel.tourName"/>
      </el-form-item>
      <el-form-item :label="t('camera.preset')" prop="cameraTourPresets" :error="formErrors.Name">
        <object-select-from-url
            :request-fn="() => getAllPresetList(cameraId)"
            :appendQuery="{cameraId: cameraId}"
            v-model="formModel.cameraTourPresets"
            multiple
            filterable :placeholder="t('camera.selectTourPoint')"
            col-value="id"
        ></object-select-from-url>
      </el-form-item>
      <base-table :data="formModel.cameraTourPresets" :columns="tourPointColumns"></base-table>
    </template>
  </FormWrapper>
</template>

<script setup lang="tsx">
import { useLang } from '@/hooks/web/useI18n'
import FormWrapper from '@/components/Form/FormWrapper.vue'
import {computed} from 'vue'
import {rule} from '@/utils/validate'
// import {isFormEditing} from '@/utils/is'
import {FormRules, ElInput} from 'element-plus'
import {BaseTable} from "@/components/Table";
import {addTour, getAllPresetList} from "@/api/camera";
import {useRoute} from "vue-router";

const { t } = useLang()

const formModel = defineModel<any>('formModel')
const route = useRoute()
const cameraId = route.params.id as string
const tourPointColumns = computed(() => [
  {prop: 'name', label: t('camera.presetName')},
  {
    label: t('camera.dwellTime'),
    slots: {
      default: (scope: any) => (
          <ElInput
              modelValue={scope.row.stayTime}
              placeholder={t('camera.dwellTimePlaceholder')}
              onUpdate:modelValue={(val: string) => {
                scope.row.stayTime = val
              }}
          />
      )
    }
  },
])

// const isEditing = computed(() => {
//   return isFormEditing(formModel.value)
// })
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    tourName: [rule('required', true), rule('min', 3)],
  }
  return rules
})
const emit = defineEmits<(e: 'success', data: any) => void>()
const handleSuccess = (data: any) => {
  emit('success', data)
}
</script>
