<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '100px'}"
      :request-fn="addUserApi"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <el-form-item label="Username" prop="username" :error="formErrors.Username">
        <el-input v-model="formModel.username"/>
      </el-form-item>

      <el-form-item label="Password" prop="password" :error="formErrors.Password">
        <el-input v-model="formModel.password" type="password"/>
      </el-form-item>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import {addUserApi} from "@/api/user";
import type {FormInstance} from "element-plus";

defineProps<{
  formModel: Record<string, any>,
  formProps?: Partial<FormInstance>,
  requestFn: (data?: Record<string, any>) => Promise<any>
}>()
const handleSuccess = (data: any) => {
  console.log('Login success!', data)
}
</script>
