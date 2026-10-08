<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '140px', rules: formRules, labelPosition: isMobile ? 'top': 'left' }"
      :request-fn="isEditing ? editUserApi : addUserApi"
      :isEditing="isEditing"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <div class="flex flex-col md:flex-row gap-2">
        <el-form-item :label="t('user.fields.username')" prop="username" :error="formErrors.Username">
          <el-input v-model="formModel.username"  :placeholder="t('user.fields.usernamePlaceholder')"/>
        </el-form-item>
        <el-form-item :label="t('user.fields.password')" prop="password" :error="formErrors.Password">
          <el-input v-model="formModel.password" type="password" placeholder="••••••" autocomplete="off"/>
        </el-form-item>
      </div>
      <div class="flex flex-col md:flex-row gap-2">
        <el-form-item :label="t('user.fields.firstName')" prop="firstName" :error="formErrors.FirstName">
          <el-input v-model="formModel.firstName"  :placeholder="t('user.fields.firstNamePlaceholder')"/>
        </el-form-item>
        <el-form-item :label="t('user.fields.lastMiddleName')" prop="lastMiddleName" :error="formErrors.LastMiddleName">
          <el-input v-model="formModel.lastMiddleName" :placeholder="t('user.fields.lastMiddleNamePlaceholder')"/>
        </el-form-item>
      </div>
      <div class="flex flex-col md:flex-row gap-2">
        <el-form-item label="Email" prop="email" :error="formErrors.Email">
          <el-input v-model="formModel.email" placeholder="example@gmail.com"/>
        </el-form-item>
        <el-form-item :label="t('user.fields.phone')" prop="phone" :error="formErrors.Phone">
          <el-input v-model="formModel.phone" :placeholder="t('user.fields.phonePlaceholder')"/>
        </el-form-item>
      </div>
      <div class="flex flex-col md:flex-row gap-2">
        <el-form-item label="Telegram User" prop="telegramUsername" :error="formErrors.TelegramUsername">
          <el-input v-model="formModel.telegramUsername"/>
        </el-form-item>
        <el-form-item :label="t('user.fields.roles')" prop="roles" :error="formErrors.Roles">
          <ObjectSelectFromUrl
            v-model="formModel.roles"
            :requestFn="getAllRoleApi"
            col-value="id"
            value-key="id"
            multiple
            filterable
            style="width: 232px;"
          />
        </el-form-item>
      </div>
      <div class="flex flex-col md:flex-row gap-2">
        <el-form-item :label="t('fields.area')" prop="areaIds" :error="formErrors.AreaIds">
          <tree-select-remote
            v-model="formModel.areaIds"
            :requestFn="getAllTreeAreaApi"
            multiple
            filterable
            style="width: 232px;"
          />
        </el-form-item>
        <el-form-item :label="t('fields.status')" prop="status" :error="formErrors.Status">
          <select-from-config
            key-config="userStatusList"
            v-model="formModel.status"
            col-value="code"
            style="width: 232px;"
          />
        </el-form-item>
      </div>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
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
import { useAppStore } from '@/store/modules/app'

const { t } = useLang()

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile)

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
