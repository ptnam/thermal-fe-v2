<template>
  <el-form
    ref="refForm"
    label-position="left"
    :model="props.formModel"
    :validate-on-rule-change="false"
    require-asterisk-position="right"
    v-bind="props.formProps"
  >
    <div class="drawer drawer-md">
      <div class="drawer-header">
        <h3>{{ title}}</h3>
        <button type="button" class="close-drawer" @click="triggerCancel">×</button>
      </div>
      <div class="drawer-body mt-2">
        <slot :formErrors="formErrors" />
      </div>
      <div class="drawer-footer">
        <slot name="button">
          <div class="mt-4 w-full text-center">
            <cancel-button @click="triggerCancel"></cancel-button>
            <save-button :loading="loading" @click="submitForm"></save-button>
          </div>
        </slot>
      </div>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { useFormRequest } from '@/hooks/web/useFormRequest'
import { ElMessage, FormInstance } from 'element-plus'
import { ref, inject } from 'vue'
import SaveButton from '@/components/Button/SaveButton.vue'
import CancelButton from '@/components/Button/CancelButton.vue'

const injectedCancelDialog = inject<() => void>('cancelDialog')

function triggerCancel() {
  if (injectedCancelDialog) {
    injectedCancelDialog()
  }
}

const props = defineProps<{
  title?: String
  formModel: Record<string, any>
  formProps?: Partial<FormInstance>
  requestFn: (...args: any[]) => Promise<any>
  transformFormData?: Function
  isEditing?: boolean
}>()

const emits = defineEmits(['success'])
const refForm = ref<FormInstance>()
const { formErrors, submit, loading, clearErrors, setErrors } = useFormRequest()

const submitForm = async () => {
  const valid = await refForm?.value?.validate()
  if (valid) {
    const formData = props.transformFormData
      ? props.transformFormData(JSON.parse(JSON.stringify(props.formModel)))
      : props.formModel
    const args = props.isEditing ? [props.formModel.id, formData] : [formData]
    const { success, data } = await submit(props.requestFn, ...args)
    if (success) {
      ElMessage({
        message: 'Lưu thành công!',
        type: 'success',
      })
      emits('success', data)
    }
  }
}

defineExpose({
  loading,
  formErrors,
  submit,
  clearErrors,
  setErrors,
  submitForm,
  triggerCancel
})
</script>
