<template>
  <FormWrapper
    :form-model="formModel"
    :form-props="{ labelWidth: '180px', rules: formRules }"
    :request-fn="isEditing ? editNotificationChannelApi : addNotificationChannelApi"
    :isEditing="isEditing"
    @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <el-form-item label="Tên kênh cảnh báo" prop="name" :error="formErrors.Name">
        <el-input v-model="formModel.name" />
      </el-form-item>
      <el-form-item label="Mã cảnh báo" prop="code" :error="formErrors.Code">
        <el-input v-model="formModel.code" />
      </el-form-item>
      <el-form-item label="Nơi nhận cảnh báo" prop="channelTypes" :error="formErrors.ChannelTypes">
        <select-from-config
          v-model="formModel.channelTypes"
          key-config="notificationChannelTypeList"
          col-value="code"
          col-label="name"
          clearable
          multiple
        ></select-from-config>
      </el-form-item>
      <el-form-item
        label="Người dùng"
        prop="users"
        :error="formErrors?.Users"
      >
        <object-infinite-select
          v-model="formModel.users"
          :request-fn="getUserListApi"
          :append-query="{ status: STATUS_ACTIVE }"
          col-value="id"
          col-label="fullName"
          multiple
        />
      </el-form-item>
      <el-form-item
        v-show="isEditing"
        label="Trạng thái"
        prop="channelStatus"
        :error="formErrors.ChannelStatus"
      >
        <select-from-config
          v-model="formModel.channelStatus"
          key-config="notificationChannelStatusList"
          colValue="code"
        />
      </el-form-item>
      <el-form-item label="Ghi chú" prop="note" :error="formErrors.Note">
        <el-input v-model="formModel.note" />
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
import { addNotificationChannelApi, editNotificationChannelApi } from '@/api/notification-channel'
import {
  STATUS_ACTIVE,
} from '@/constants'
import { getUserListApi } from '@/api/user'
import ObjectInfiniteSelect from "@/components/Selection/ObjectInfiniteSelect.vue";

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})

const isEditing = computed(() => {
  return isFormEditing(props.formModel)
})
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [rule('required', true, 'name')],
    code: [rule('required', true, 'code')],
    channelTypes: [rule('required', true, 'channelTypes')],
    users: [rule('required', true, 'users')],
  }
  return rules
})
const emit = defineEmits<(e: 'success', data: any) => void>()
const handleSuccess = (data: any) => {
  emit('success', data)
}
</script>
