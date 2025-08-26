<template>
  <FormWrapper
    :form-model="formModel"
    :form-props="{ labelWidth: '140px', rules: userRules }"
    :request-fn="isEditing ? editMachineTypeApi : addMachineTypeApi"
    :isEditing="isEditing"
    @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <el-form-item label="Tên loại thiết bị" prop="name" :error="formErrors.Name">
        <el-input v-model="formModel.name" />
      </el-form-item>
      <el-form-item label="Mã loại thiết bị" prop="code" :error="formErrors.Code">
        <el-input v-model="formModel.code" />
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status" :error="formErrors.Status">
        <select-from-config
          key-config="userStatusList"
          v-model="formModel.status"
          col-value="code"
        />
      </el-form-item>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import { computed } from 'vue'
import { rule } from '@/utils/validate'
import { isFormEditing } from '@/utils/is'
import { FormRules } from 'element-plus'
import { addMachineTypeApi, editMachineTypeApi } from '@/api/machine-type'

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})

const isEditing = computed(() => {
  return isFormEditing(props.formModel)
})
const userRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [rule('required', true, 'username')],
    code: [rule('required', true, 'email')],
    status: [rule('required', true, 'status')],
  }

  if (!isEditing.value) {
    rules.password = [rule('required', true, 'password'), rule('min', 6, 'password')]
  }

  return rules
})
const emit = defineEmits<(e: 'success', data: any) => void>()
const handleSuccess = (data: any) => {
  emit('success', data)
}
</script>
