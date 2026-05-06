<template>
  <div>
    <div class="tab-header-styled">Thông số góc quay</div>
    <el-tabs type="border-card" class="!mt-0">
      <el-tab-pane label="Presets">
        <preset-table :data="presets"></preset-table>
      </el-tab-pane>
      <el-tab-pane label="Tours">
        <tour-table :data="tours" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import PresetTable from '@/views/category/camera/components/PresetTable.vue'
import TourTable from '@/views/category/camera/components/TourTable.vue'

defineProps({
  presets: {
    type: Array,
    required: true,
  },
  tours: {
    type: Array,
    required: true,
  },
})
</script>
<style scoped>
.tab-header-styled {
  display: inline-block;
  padding: 10px 20px;
  color: var(--primary);
  font-weight: 600;
  border-bottom: 2px solid var(--primary);
  margin-bottom: 25px;
  font-size: 14px;
}
</style>