<script setup>
import {useAppStore} from '@/store/modules/app'
import {onMounted, computed, ref} from 'vue'
import NarBarNotification from "@/components/DropDown/NarBarNotification.vue";
import ChangePasswordForm from "@/layout/components/ChangePasswordForm.vue";
import {changePasswordApi} from "@/api/user/index.ts";
import {useDialogForm} from "@/hooks/web/useDialogForm.tsx";
import {useUserStore} from "@/store/modules/user.ts";
import {useLang} from "@/hooks/web/useI18n.ts";

const appStore = useAppStore()
const visibleDropdown = ref(false);
const toggleUserDropdown = () => {
  visibleDropdown.value = !visibleDropdown.value;
}

const toggleMobileMenu = () => {
  const menu = document.getElementById('mainMenu');
  menu.classList.toggle('open');
  document.body.classList.toggle('menu-open-body');
}

const loadEventMenu = () => {
  // Auto-label table cells for mobile card view
  const tables = document.querySelectorAll('.data-table');
  tables.forEach(table => {
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        if (headers[index] && !cell.hasAttribute('data-label')) {
          cell.setAttribute('data-label', headers[index]);
        }
      });
    });
  });

  // Attach click listeners to all nav wrappers with dropdowns
  const navWrappers = document.querySelectorAll('.nav-wrapper');

  navWrappers.forEach(wrapper => {
    const navLink = wrapper.querySelector('.nav-link');
    const dropdown = wrapper.querySelector('.dropdown-menu, .mega-menu');

    if (dropdown && navLink) {
      navLink.addEventListener('click', (e) => {
        // Only prevent default and toggle if on mobile
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();

          // Close other open menus
          navWrappers.forEach(w => {
            if (w !== wrapper) {
              w.classList.remove('active');
            }
          });

          // Toggle current
          wrapper.classList.toggle('active');
        }
      });
    }
  });

  // Close menu when clicking outside (Mobile only)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && document.body.classList.contains('menu-open-body')) {
      const menu = document.getElementById('mainMenu');
      const toggleBtn = document.querySelector('.mobile-btn');

      // If click is outside menu and not on the toggle button
      if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleMobileMenu();
      }
    }
  });
}

const store = useAppStore()
const userStore = useUserStore()
// const router = useRouter()

const userName = computed(() => userStore.getUserName)
const logout = async () => {
  userStore.logoutConfirm()
}
const {showDialog, closeDialog} = useDialogForm();

const {t} = useLang()
const forgetPassword = () => {
  showDialog(
      {
        component: ChangePasswordForm,
        formModel: {
          currentPassword: '',
          newPassword: '',
        },
        requestFn: changePasswordApi,
        onSuccess: () => {
          closeDialog();
        },
      },
      {title: t("user.changePassword")},
  );
}
onMounted(() => {
  loadEventMenu()
})
</script>
<template>
  <nav class="navbar">
    <div style="display:flex; align-items:center">
      <button class="mobile-btn" @click="toggleMobileMenu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <router-link to="/dashboard" class="brand" style="text-decoration:none">
        <div class="logo-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
               stroke-linejoin="round">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          </svg>
        </div>
        IFS - AI
      </router-link>
    </div>

    <div class="nav-menu" id="mainMenu">
      <div class="nav-wrapper">
        <router-link class="nav-link active-link" to="/dashboard">TRANG CHỦ</router-link>
      </div>
      <div class="nav-wrapper">
        <router-link class="nav-link" to="/live">GIÁM SÁT TRỰC TIẾP</router-link>
      </div>
      <div class="nav-wrapper">
        <div class="nav-link">THEO DÕI ĐIỂM ĐO
          <svg class="nav-arrow" width="10" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
        <div class="dropdown-menu">
          <router-link class="menu-link" to="/event/ai-notification">Cảnh báo AI</router-link>
          <router-link class="menu-link" to="/event/notification-system">Nhiệt độ vượt ngưỡng</router-link>
          <router-link class="menu-link" to="/event/event-history">Nhật ký nhiệt độ</router-link>
          <router-link class="menu-link" to="/event/home">Tổng hợp phân tích</router-link>
        </div>
      </div>

      <div class="nav-wrapper">
        <div class="nav-link">QUẢN TRỊ HỆ THỐNG
          <svg class="nav-arrow" width="10" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
        <div class="dropdown-menu mega-menu">
          <div class="mega-col">
            <div class="col-header">HẠ TẦNG & THIẾT BỊ</div>
            <router-link class="menu-link" to="/category/area">Khu vực</router-link>
            <router-link class="menu-link" to="/category/camera-list">Camera</router-link>
            <router-link class="menu-link" to="/category/camera-sensor">Cảm biến</router-link>
            <router-link class="menu-link" to="/category/machine-type">Loại Thiết bị</router-link>
            <router-link class="menu-link" to="/category/machine-list">Thiết bị</router-link>
          </div>
          <div class="mega-col">
            <div class="col-header">THIẾT LẬP CẢNH BÁO</div>
            <router-link class="menu-link menu-item-with-bg" to="/setting/notification-channel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Kênh Cảnh báo
            </router-link>

            <router-link class="menu-link menu-item-with-bg" to="/setting/notification-group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              Bộ cảnh báo
            </router-link>
          </div>
          <div class="mega-col">
            <div class="col-header">QUẢN LÝ NGƯỜI DÙNG</div>
            <router-link class="menu-link menu-item-with-bg" to="/category/user">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Người dùng
            </router-link>

            <a href="/report/download/CGI Manual.pdf" class="menu-link menu-item-with-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Hướng dẫn sử dụng
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="header-actions">
      <el-switch
          :model-value="appStore.isDark"
          @update:modelValue="appStore.setDark"
          class="ml-2 theme-switch !h-[26px]"
          style="--el-switch-on-color: #10172a; --el-switch-off-color: #f3f4f6"
      />

      <nar-bar-notification></nar-bar-notification>
      <div class="user-wrapper">
        <div class="user-profile" @click="toggleUserDropdown">
          <div class="user-avatar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span class="user-name">{{ userName }}</span>
        </div>
        <div v-show="visibleDropdown" class="fixed w-screen h-screen bg-blue top-0 left-0" @click="toggleUserDropdown"> </div>
        <div v-show="visibleDropdown" class="user-dropdown">
          <router-link class="dropdown-item"
                       to="/dashboard">Home
          </router-link>
          <a @click="forgetPassword" class="dropdown-item">Quên mật khẩu</a>
          <div class="user-dropdown-divider"></div>
          <a @click="logout" class="dropdown-item logout">Log Out</a>
        </div>
      </div>
    </div>
  </nav>
</template>