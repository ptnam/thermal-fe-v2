<template>
  <el-tabs type="border-card">
    <el-tab-pane label="Presets">
      <preset-table :data="presets"></preset-table>
    </el-tab-pane>
    <el-tab-pane label="Tours">
      <tour-table :data="tours" />
    </el-tab-pane>
  </el-tabs>
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
