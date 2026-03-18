<script setup lang="tsx">

import TemperatureLog from "@/views/event/components/TemperatureLog.vue";
import ThresholdWarning from "@/views/event/components/ThresholdWarning.vue";
import {ref} from "vue";


const tab = ref(1)
</script>

<template>
  <div class="container">
    <div class="bread-crumb">Theo dõi điểm đo / <span>Tổng hợp phân tích</span></div>

    <div class="tabs-container">
      <div :class="['tab-item', tab === 1 ? 'active' : '']" @click="() => tab = 1">Nhật ký nhiệt độ theo điểm đo</div>
      <div :class="['tab-item', tab === 2 ? 'active' : '']" @click="() => tab = 2">Thống kê số lượng cảnh báo</div>
    </div>

    <!-- TAB 1: NHẬT KÝ NHIỆT ĐỘ -->
    <div :class="['tab-content', tab === 1 ? 'active' : '']">
      <TemperatureLog></TemperatureLog>
    </div>

    <!-- TAB 2: THỐNG KÊ CẢNH BÁO -->
    <div :class="['tab-content', tab === 2 ? 'active' : '']">
     <threshold-warning></threshold-warning>
    </div>

  </div>
</template>
<style scoped>
.tabs-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1px;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  color: var(--text-sub);
  font-weight: 600;
  font-size: 14px;
  transition: 0.3s;
  border-bottom: 3px solid transparent;
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px 8px 0 0;
}

.tab-item:hover {
  color: var(--primary);
  background: rgba(255, 255, 255, 0.05);
}

.tab-item.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
}

.tab-content {
  display: none;
  animation: fadeIn 0.4s ease;
}

.tab-content.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-box {
  padding: 24px;
  min-height: 480px;
  background: rgba(255, 255, 255, 0.01);
  border-radius: 12px;
  margin-top: 10px;
}

/* NEW HORIZONTAL FILTER STYLE */
.filter-section-modern {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row-inline {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.filter-group-inline {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  flex: 1;
}

.filter-group-inline label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* Multi-select box looking like an input */
.multi-select-box {
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
  min-width: 150px;
}

.multi-select-box:hover {
  border-color: var(--primary);
}

.tags-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: hidden;
  position: relative;
  flex: 1;
  /* Optional: Add a fade effect to the right */
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}

.select-single-modern,
.date-range-box input {
  width: 100% !important;
}

.tag-pill {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  white-space: nowrap;
}

.tag-pill i {
  color: var(--text-sub);
  cursor: pointer;
  font-style: normal;
  font-size: 16px;
  line-height: 1;
  margin-top: -1px;
}

.tag-pill i:hover {
  color: var(--danger);
}

.select-single-modern {
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  min-height: 38px;
}

.date-range-box {
  display: flex;
  align-items: center;
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
  height: 38px;
  gap: 10px;
}

.date-range-box svg {
  color: var(--primary);
  flex-shrink: 0;
}

.date-range-box input {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 14px;
  width: 165px;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
}

/* Style datetime-local calendar icon */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1) brightness(0.9);
  cursor: pointer;
}

.btn-search-primary {
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 24px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.btn-search-primary:hover {
  background: #2563EB;
  transform: translateY(-1px);
}

.btn-icon-square {
  width: 38px;
  height: 38px;
  border: 1px solid var(--border);
  background: var(--bg-body);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  cursor: pointer;
  transition: 0.2s;
}

.btn-icon-square:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.status-badge {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.status-unprocessed {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Dropdown with checkboxes */
.dropdown-check-list {
  position: relative;
}

.dropdown-check-list .items {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-height: 250px;
  overflow-y: auto;
  margin-top: 4px;
}

.dropdown-check-list.visible .items {
  display: block;
}

.dropdown-item-check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: 0.2s;
  color: var(--text-main);
  font-size: 13px;
}

.dropdown-item-check:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item-check input {
  cursor: pointer;
  accent-color: var(--primary);
}

/* Export Dropdown */
.export-dropdown {
  position: relative;
  display: inline-block;
}

.btn-export {
  background: var(--success);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.btn-export:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.export-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  z-index: 1001;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  margin-top: 8px;
  animation: fadeIn 0.2s ease;
}

.export-dropdown.open .export-menu {
  display: block;
}

.export-item {
  padding: 10px 16px;
  color: var(--text-main);
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--primary);
}

/* AVG and Filter styles */
.header-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avg-dropdown {
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  gap: 8px;
  height: 34px;
}

.avg-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 4px;
  border-radius: 4px;
}

.avg-select {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  padding-right: 4px;
}

.filter-badge-simple {
  background: #111827;
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
  cursor: pointer;
  height: 34px;
  font-weight: 600;
}

.badge-count {
  background: #3B82F6;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

/* AVG Menu Styles */
.avg-dropdown {
  position: relative;
}

.avg-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: #1a202c;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 1000;
  overflow: hidden;
}

.avg-menu.show {
  display: block;
}

.avg-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}

.avg-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.avg-item.active {
  background: rgba(59, 130, 246, 0.1);
}

.avg-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.box-max {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.box-min {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.box-avg {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.avg-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.avg-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.4;
}

.avg-check {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
}

.avg-item.active .avg-check {
  display: block;
}

/* Filter Drawer Styles - Final Refined Port */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  display: none;
  justify-content: flex-end;
  z-index: 2200;
  backdrop-filter: blur(2px);
}

.drawer-overlay.open {
  display: flex;
}

.drawer {
  width: 420px;
  height: 100%;
  background: #1e293b;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-weight: 700;
}

.close-drawer {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  transition: 0.2s;
}

.close-drawer:hover {
  color: #ffffff;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

/* Custom Scrollbar */
.drawer-body::-webkit-scrollbar,
.scroll-list::-webkit-scrollbar {
  width: 4px;
}

.drawer-body::-webkit-scrollbar-track,
.scroll-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.drawer-body::-webkit-scrollbar-thumb,
.scroll-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.filter-group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}

.filter-group:last-child {
  border-bottom: none;
}

.filter-group-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.filter-group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  letter-spacing: 0.4px;
}

.section-badge {
  background: #3b82f6;
  color: white;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.filter-group-content {
  padding: 0 16px 16px;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scroll-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.drawer-filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.15s;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
}

.drawer-filter-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.drawer-filter-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: #ffffff;
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  flex-shrink: 0;
  background: #ffffff;
}

.drawer-filter-item.active .custom-checkbox {
  background: #3b82f6;
  border-color: #3b82f6;
}

.custom-checkbox svg {
  width: 12px;
  height: 12px;
  color: white;
  display: none;
}

.drawer-filter-item.active .custom-checkbox svg {
  display: block;
}

/* Group Collapsible */
.filter-group-content {
  display: block;
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.filter-group.collapsed .filter-group-content {
  max-height: 0;
  padding-bottom: 0;
}

.filter-group.collapsed .filter-group-header svg {
  transform: rotate(-90deg);
}

.filter-group-header svg {
  transition: transform 0.2s ease;
}

.time-group {
  margin-bottom: 16px;
}

.time-label {
  font-size: 13px;
  color: var(--text-sub);
  margin-bottom: 8px;
  display: block;
}

.time-input-container {
  position: relative;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time-input-container input {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
}

.time-input-container svg {
  color: var(--text-sub);
  cursor: pointer;
}

.drawer-footer {
  padding: 24px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 12px;
  background: #1e293b;
}

.btn-reset-drawer {
  flex: 1;
  background: #94A3B8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-reset-drawer:hover {
  background: #64748b;
}

.btn-apply-drawer {
  flex: 1.5;
  background: #60a5fa;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-apply-drawer:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}
</style>