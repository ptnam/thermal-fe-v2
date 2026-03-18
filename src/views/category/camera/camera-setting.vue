<template>
  <div class="container main-container" >
    <div class="camera-setting">

      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="Quản lý tour" name="1">
          <setting-tour></setting-tour>
        </el-tab-pane>
        <el-tab-pane label="Quản lý góc quay" name="3">
          <setting-preset></setting-preset>
        </el-tab-pane>
        <el-tab-pane label="Live" name="2">

        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script setup lang="tsx">
import {ref } from 'vue'
import SettingTour from "@/views/category/camera/components/SettingTour.vue";
import SettingPreset from "@/views/category/camera/components/SettingPreset.vue";
const activeName = ref("1")
</script>