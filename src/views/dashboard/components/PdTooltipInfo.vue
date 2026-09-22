<template>
  <div class="pd-tooltip">
    <p class="pd-tooltip__title">Thiết bị: {{ machine?.name }}</p>

    <p v-if="loading && !components.length" class="pd-tooltip__empty">Đang tải dữ liệu...</p>
    <p v-else-if="stale" class="pd-tooltip__empty">Không có dữ liệu gần đây</p>
    <template v-else-if="components.length">
      <div v-for="item in components" :key="item.machineComponentId" class="pd-tooltip__row">
        <span>{{ item.machineComponentName }}</span>
        <span v-if="item.lastLevelDb != null" class="font-bold">{{ item.lastLevelDb }} dB</span>
        <span v-else class="pd-tooltip__empty">Chưa có dữ liệu</span>
      </div>
    </template>
    <p v-else class="pd-tooltip__empty">Chưa có bộ phận nào được giám sát PD</p>
  </div>
</template>

<script setup lang="ts">
// Tooltip hover marker PD: tên bộ phận + dB; chi tiết đầy đủ ở PdMachineDetail.vue.
defineProps<{
  machine: { name?: string } | null
  components: any[]
  loading?: boolean
  stale?: boolean
}>()
</script>

<style scoped>
.pd-tooltip {
  padding: 8px 12px;
  min-width: 200px;
  font-size: 14px;
  color: var(--text-main);
}

.pd-tooltip__title {
  font-weight: 700;
  text-align: center;
  margin: 0 0 6px;
}

.pd-tooltip__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 2px 0;
}

.pd-tooltip__empty {
  font-size: 0.8125rem;
  color: var(--text-sub);
  margin: 0;
}
</style>
