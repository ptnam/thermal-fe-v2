<script setup>
import {useAppStore} from '@/store/modules/app'
import {onMounted} from 'vue'

const appStore = useAppStore()

const toggleNotifDropdown = () => {
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

const toggleUserDropdown = () => {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.toggle('show');
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
      <a href="dashboard.html" class="brand" style="text-decoration:none">
        <div class="logo-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
               stroke-linejoin="round">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          </svg>
        </div>
        IFS - AI
      </a>
    </div>

    <div class="nav-menu" id="mainMenu">
      <div class="nav-wrapper"><a href="dashboard.html" class="nav-link active-link">TRANG CHỦ</a></div>
      <div class="nav-wrapper"><a href="giamsattructiep.html" class="nav-link">GIÁM SÁT TRỰC TIẾP</a></div>
      <div class="nav-wrapper">
        <div class="nav-link">THEO DÕI ĐIỂM ĐO
          <svg class="nav-arrow" width="10" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
        <div class="dropdown-menu">
          <a href="theodoidiemdo_canhbaoai.html" class="menu-link">Cảnh báo AI</a>
          <a href="theodoidiemdo_canhbao.html" class="menu-link">Nhiệt độ vượt ngưỡng</a>
          <a href="theodoidiemdo_nhatkynhietdo.html" class="menu-link">Nhật ký nhiệt độ</a>
          <a href="theodoidiemdo_tonghopphantich.html" class="menu-link">Tổng hợp phân tích</a>
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
            <a href="quantrihethong_camera.html" class="menu-link">Camera</a>
            <a href="quantrihethong_cambien.html" class="menu-link">Cảm biến</a>
            <a href="quantrihethong_loaithietbi.html" class="menu-link">Loại Thiết bị</a>
            <a href="quantrihethong_thietbi.html" class="menu-link">Thiết bị</a>
          </div>
          <div class="mega-col">
            <div class="col-header">THIẾT LẬP CẢNH BÁO</div>
            <a href="thietlapcanhbao_kenhcanhbao.html" class="menu-link menu-item-with-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Kênh Cảnh báo
            </a>
            <a href="theodoidiemdo_bocanhbao.html" class="menu-link menu-item-with-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              Bộ cảnh báo
            </a>
          </div>
          <div class="mega-col">
            <div class="col-header">QUẢN LÝ NGƯỜI DÙNG</div>
            <a href="quantrihethong_nguoidung.html" class="menu-link menu-item-with-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Người dùng
            </a>
            <a href="#" class="menu-link menu-item-with-bg">
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

      <div class="notif-wrapper">
        <el-button class="notif-btn" @click="toggleNotifDropdown">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="notif-badge">99+</span>
        </el-button>

        <div class="notif-dropdown" id="notifDropdown">
          <div class="notif-list">
            <a href="#" class="notif-item">
              <div class="notif-title">Quá nhiệt</div>
              <div class="notif-main-row">
                <div class="notif-source">SĐ1S_Liên Trì</div>
                <div class="notif-time">2026-02-12 08:12:25</div>
              </div>
              <div class="notif-bottom-row">
                <span>132</span>
                <span>132_Cin</span>
              </div>
            </a>
            <a href="#" class="notif-item">
              <div class="notif-title">Quá nhiệt</div>
              <div class="notif-main-row">
                <div class="notif-source">SĐ1S_Liên Trì</div>
                <div class="notif-time">2026-02-12 08:12:25</div>
              </div>
              <div class="notif-bottom-row">
                <span>132</span>
                <span>132_Cou</span>
              </div>
            </a>
            <a href="#" class="notif-item">
              <div class="notif-title">Quá nhiệt</div>
              <div class="notif-main-row">
                <div class="notif-source">SĐ1S_Liên Trì</div>
                <div class="notif-time">2026-02-12 07:58:25</div>
              </div>
              <div class="notif-bottom-row">
                <span>132</span>
                <span>132_Cou</span>
              </div>
            </a>
            <a href="#" class="notif-item">
              <div class="notif-title">Quá nhiệt</div>
              <div class="notif-main-row">
                <div class="notif-source">SĐ1S_Liên Trì</div>
                <div class="notif-time">2026-02-12 07:58:25</div>
              </div>
              <div class="notif-bottom-row">
                <span>132</span>
                <span>132_Cin</span>
              </div>
            </a>
            <a href="#" class="notif-item">
              <div class="notif-title">Quá nhiệt</div>
              <div class="notif-main-row">
                <div class="notif-source">SĐ1S_Liên Trì</div>
                <div class="notif-time">2026-02-12 07:49:25</div>
              </div>
              <div class="notif-bottom-row">
                <span>132</span>
                <span>132_Cin</span>
              </div>
            </a>
          </div>
          <div class="notif-footer">
            <a href="#" class="btn-view-all">Xem tất cả</a>
          </div>
        </div>
      </div>

      <div class="user-wrapper">
        <div class="user-profile" @click="toggleUserDropdown">
          <div class="user-avatar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span class="user-name">thangdv</span>
        </div>

        <div class="user-dropdown" id="userDropdown">
          <a href="dashboard.html" class="dropdown-item">Home</a>
          <a href="#" class="dropdown-item">Quên mật khẩu</a>
          <div class="user-dropdown-divider"></div>
          <a href="#" class="dropdown-item logout">Log Out</a>
        </div>
      </div>
    </div>
  </nav>
</template>