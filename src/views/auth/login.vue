<script setup lang="ts">
import {rule} from '@/utils/validate'
import {computed, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/store/modules/user'
import {loginApi} from '@/api/login'
import {UserLoginType} from '@/api/login/types'
import {FormInstance} from 'element-plus'
import {requestAndSendFcmToken} from "@/plugins/firebase/firebase";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loginForm = ref<FormInstance>()
const loading = ref(false)
const loginRules = computed(() => {
  return {
    username: [rule('required', true, 'username'), rule('min', 3, 'username')],
    password: [rule('required', true, 'password'), rule('min', 6, 'password')],
  }
})
const formParams = reactive(<UserLoginType>{
  username: '',
  password: '',
})

const handleLogin = () => {
  loginForm?.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      loginApi(formParams)
          .then((res) => {
            const redirect = route.query && (route.query.redirect as string)
            userStore.updateStatesFromResponse(res)
            requestAndSendFcmToken()
            router.push({path: redirect ?? '/'})
          })
          .finally(() => {
            loading.value = false
          })
    }
  })
}
</script>

<template>
  <div class="body-login">
    <div class="login-card">
      <div class="logo-area">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24">
            <path d="M13 3L11 3L5 14L11 14L9 21L19 9L13 9L13 3Z"/>
          </svg>
        </div>
        <div class="app-name">IFS - AI</div>
        <div class="app-desc">Phần mềm Camera Thông minh</div>
      </div>

      <el-form
          ref="loginForm"
          :model="formParams"
          :rules="loginRules"
          class="login-form"
          auto-complete="on"
          label-position="left"
      >

        <div class="form-group">
          <label class="label">Tài khoản</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <input v-model="formParams.username" type="email" class="form-input" placeholder="admin@evn.com.vn">
            <el-form-item prop="username"></el-form-item>
          </div>
        </div>

        <div class="form-group">
          <label class="label">Mật khẩu</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24">
              <path
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input v-model="formParams.password" type="password" class="form-input" placeholder="••••••••">
            <el-form-item prop="password"></el-form-item>
          </div>
        </div>

        <div class="form-options">

          <a href="#" class="forgot-pass">Quên mật khẩu?</a>
        </div>

        <el-button
            :loading="loading"
            @click="handleLogin"
            class="btn-submit">
          ĐĂNG NHẬP HỆ THỐNG
        </el-button>
      </el-form>

      <div class="login-footer">
        &copy; {{ new Date().getFullYear() }} IFS AI. All rights reserved.
      </div>

    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@/assets/styles/login.scss";
</style>