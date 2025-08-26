<!-- src/views/error/403.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md text-center">
      <h1 class="text-7xl font-bold text-red-600">403</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mt-4">Không có quyền truy cập</h2>
      <p class="text-gray-600 mt-2">
        Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại quyền hạn hoặc liên hệ quản trị viên.
      </p>
      <router-link
        to="/dashboard"
        class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
        Quay lại Trang chủ
      </router-link>
    </div>
  </div>
</template>
