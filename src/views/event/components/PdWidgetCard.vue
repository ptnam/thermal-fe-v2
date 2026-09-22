<template>
  <div class="pd-widget-card">
    <div class="pd-widget-card__header">
      <h3 class="pd-widget-card__title"><slot name="title" /></h3>
      <div v-if="$slots.filters" class="pd-widget-card__filters">
        <slot name="filters" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
// Khung card dùng chung cho các widget trong tab "Thống kê Phóng điện vượt ngưỡng" (màn Tổng hợp phóng điện) - tiêu
// đề + bộ lọc trên 1 hàng, đường kẻ ngăn, nội dung (biểu đồ/bảng) bên dưới. Trước đây mỗi widget tự
// khai báo lại y hệt phần CSS này (PdThresholdStats/PdAreaComparison/PdLevelDistribution/
// PdTopComponents/PdResolutionStats/PdLevelLog) - gộp về đây để sửa 1 chỗ, đồng bộ mọi nơi.
</script>

<style scoped>
.pd-widget-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 18px 20px;
}

.pd-widget-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.pd-widget-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.pd-widget-card__filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
