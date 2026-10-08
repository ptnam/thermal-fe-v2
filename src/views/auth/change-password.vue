<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6 text-center">{{ t('login.forgot.title') }}</h2>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" :placeholder="t('login.forgot.emailPlaceholder')" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="w-full" @click="submitForm">{{ t('login.forgot.sendRequest') }}</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="successMessage"
        type="success"
        :title="successMessage"
        class="mt-4"
        show-icon
      />
      <el-alert
        v-if="errorMessage"
        type="error"
        :title="errorMessage"
        class="mt-4"
        show-icon
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLang } from '@/hooks/web/useI18n'

const { t } = useLang()
const formRef = ref(null)

const form = ref({
  email: '',
})

const rules = {
  email: [
    { required: true, message: () => t('login.forgot.emailRequired'), trigger: 'blur' },
    { type: 'email', message: () => t('login.forgot.emailInvalid'), trigger: ['blur', 'change'] },
  ],
}

const successMessage = ref('')
const errorMessage = ref('')

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // Giả lập gửi yêu cầu đặt lại mật khẩu
      setTimeout(() => {
        successMessage.value = t('login.forgot.sent')
        errorMessage.value = ''
      }, 1000)
    } else {
      errorMessage.value = t('login.forgot.checkInfo')
      successMessage.value = ''
    }
  })
}
</script>

<style scoped>
</style>
