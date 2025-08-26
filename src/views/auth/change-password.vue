<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6 text-center">Quên Mật Khẩu</h2>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Nhập email của bạn" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="w-full" @click="submitForm">Gửi yêu cầu</el-button>
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
import { ElMessage } from 'element-plus'

const formRef = ref(null)

const form = ref({
  email: '',
})

const rules = {
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] },
  ],
}

const successMessage = ref('')
const errorMessage = ref('')

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // Giả lập gửi yêu cầu đặt lại mật khẩu
      setTimeout(() => {
        successMessage.value = 'Email đặt lại mật khẩu đã được gửi!'
        errorMessage.value = ''
      }, 1000)
    } else {
      errorMessage.value = 'Vui lòng kiểm tra lại thông tin!'
      successMessage.value = ''
    }
  })
}
</script>

<style scoped>
</style>
