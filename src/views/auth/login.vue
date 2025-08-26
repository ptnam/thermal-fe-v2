<script setup lang="ts">
import { rule } from '@/utils/validate'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import { loginApi } from '@/api/login'
import { UserLoginType } from '@/api/login/types'
import { FormInstance } from 'element-plus'
import { useLang } from '@/hooks/web/useI18n'
import {requestAndSendFcmToken} from "@/plugins/firebase/firebase";
// import LocaleDropdown from '@/components/LocaleDropdown/LocaleDropdown.vue'

const { t } = useLang()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const password = ref<HTMLInputElement | null>(null)
const loginForm = ref<FormInstance>()

const passwordType = ref('password')
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

const showPwd = () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  password?.value?.focus()
}
const handleLogin = () => {
  loginForm?.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      loginApi(formParams)
        .then((res) => {
          const redirect = route.query && (route.query.redirect as string)
          userStore.updateStatesFromResponse(res)
          requestAndSendFcmToken()
          router.push({ path: redirect ?? '/' })
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>

<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="formParams"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">{{ t('login.welcome') }}</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <SvgIcon name="user" />
        </span>
        <el-input
          ref="username"
          v-model="formParams.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <SvgIcon name="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="formParams.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <SvgIcon :name="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        size="default"
        style="width: 100%; margin-bottom: 30px"
        @click="handleLogin"
        >Login
      </el-button>
      <!--      <div class="mt-4">-->
      <!--        <locale-dropdown></locale-dropdown>-->
      <!--      </div>-->
    </el-form>
  </div>
</template>

<style lang="scss">
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    .el-input__wrapper {
      box-shadow: unset;
      background-color: unset;
      display: block;

      input {
        background: transparent;
        border: 0;
        -webkit-appearance: none;
        border-radius: 0;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;

        &:-webkit-autofill {
          box-shadow: 0 0 0 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }

    .el-input__inner {
      box-shadow: none;
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0 auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 14px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
