<script setup lang="ts">
import {useAppStore} from '@/store/modules/app'
import {useUserStore} from '@/store/modules/user'
import Breadcrumb from '@/components/Breadcrumb/base-breadcrumb.vue'
import Hamburger from '@/components/Hamburger/base-hamburger.vue'
import {computed} from 'vue'
// import { useRouter } from 'vue-router'
import NarBarNotification from '@/components/DropDown/NarBarNotification.vue'
import {UserFilled} from '@element-plus/icons-vue'
// import LocaleDropdown from '@/components/LocaleDropdown/LocaleDropdown.vue'

const store = useAppStore()
const userStore = useUserStore()
// const router = useRouter()

const userName = computed(() => userStore.getUserName)

const sidebar = computed(() => store.sidebar)
// const avatar = computed(() => userStore.userInfo)

const toggleSideBar = () => {
  store.toggleSideBar()
}
const logout = async () => {
  userStore.logoutConfirm()
}
</script>
<template>
  <div class="navbar">
    <Hamburger
        :is-active="sidebar.opened"
        class="hamburger-container"
        @toggle-click="toggleSideBar"
    />

    <Breadcrumb class="breadcrumb-container"/>

    <div class="right-menu">
<!--      <locale-dropdown size="small" class="w-[110px]!"/>-->
      <NarBarNotification class="mx-4"/>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <!--          <img :src="avatar + '?imageView2/1/w/80/h/80'" class="user-avatar" />-->
          <el-icon>
            <UserFilled/>
          </el-icon>
          {{ userName}}
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <router-link to="/dashboard">
              <el-dropdown-item> Home</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click="logout">
              <span style="display: block">Log Out</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        cursor: pointer;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
