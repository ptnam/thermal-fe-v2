<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '140px', rules: formRules }"
      :request-fn="isEditing ? editUserApi : addUserApi"
      :isEditing="isEditing"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <el-form-item label="Tên đăng nhập" prop="username" :error="formErrors.Username">
        <el-input v-model="formModel.username"/>
      </el-form-item>
      <el-form-item label="Mật khẩu" prop="password" :error="formErrors.Password">
        <el-input v-model="formModel.password" type="password"/>
      </el-form-item>
      <el-form-item label="Tên" prop="firstName" :error="formErrors.FirstName">
        <el-input v-model="formModel.firstName"/>
      </el-form-item>
      <el-form-item label="Họ và tên đệm" prop="lastMiddleName" :error="formErrors.LastMiddleName">
        <el-input v-model="formModel.lastMiddleName"/>
      </el-form-item>
      <el-form-item label="Email" prop="email" :error="formErrors.Email">
        <el-input v-model="formModel.email"/>
      </el-form-item>
      <el-form-item label="Số điện thoại" prop="phone" :error="formErrors.Phone">
        <el-input v-model="formModel.phone"/>
      </el-form-item>
      <el-form-item label="Quyền" prop="roles" :error="formErrors.Roles">
        <ObjectSelectFromUrl
            v-model="formModel.roles"
            :requestFn="getAllRoleApi"
            col-value="id"
            value-key="id"
            multiple
            filterable
        />
      </el-form-item>
      <el-form-item label="Khu vực" prop="areaIds" :error="formErrors.AreaIds">
        <tree-select-remote
            v-model="formModel.areaIds"
            :requestFn="getAllTreeAreaApi"
            multiple
            filterable
        />
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
import {addUserApi, editUserApi} from '@/api/user'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {computed} from 'vue'
import {rule} from '@/utils/validate'
import {isFormEditing} from '@/utils/is'
import {FormRules} from 'element-plus'
import {getAllRoleApi} from '@/api/role'
import ObjectSelectFromUrl from '@/components/Selection/ObjectSelectFromUrl.vue'
import {getAllTreeAreaApi} from "@/api/area";
import TreeSelectRemote from "@/components/Tree/TreeSelectRemote.vue";

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
    username: [rule('required', true, 'username'), rule('min', 3, 'username')],
    email: [rule('required', true, 'email')],
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
