<template>
  <el-drawer
      :lock-scroll="false"
      :destroy-on-close="true"
      :append-to-body="true"
      @open="dialogOpen"
      style="min-width: 600px"
      :show-close="false"
      v-bind="$attrs">
    <template #header>
      <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          </svg>
          <h3 style="color: #3b82f6; font-size: 18px; text-transform: uppercase;">THIẾT LẬP NGƯỠNG CẢNH BÁO
          </h3>
        </div>
      </div>
    </template>
    <div class="p-4 ml-2 min-h-[400px]">
      <div class="absolute" style="    right: 39px;
    top: 32px;">
        <ThresholdFilter
            v-model="thresholdListModel"
            :options="options"
            @change="changeThresholdTypeList"
        />
      </div>
      <div class="threshold-tabs">
        <threshold-tab :threshold-list="thresholdList"/>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <cancel-button @click="emits('cancel')"></cancel-button>
        <el-button
            type="primary"
            @click="emits('save', thresholdList)"
        >Lưu cấu hình</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import SaveButton from '@/components/Button/SaveButton.vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import {cloneObject} from "@/utils/objectUtils";
import {defaultLevels} from "@/views/category/machine/components/levels";
import ThresholdTab from "@/views/category/machine/components/ThresholdTab.vue";
import {useConfigStore} from "@/store/modules/configStore";
import ThresholdFilter from "@/views/category/machine-part/components/ThresholdFilter.vue";

// Props
const props = defineProps({
  thresholdList: {
    type: Array<any>,
    required: true,
  },
  machinePartThresholdList: {
    type: Array<any>,
    required: false,
  }
})
const configStore = useConfigStore();
const options = ref(configStore.getConfig('thresholdTypeList') ?? [])

// Emits
const emits = defineEmits(['save', 'cancel', 'update:thresholdList'])

const thresholdListModel = ref<any[]>([])

const dialogOpen = () => {
  thresholdListModel.value = props.thresholdList
}
const changeThresholdTypeList = () => {
  const listModeTmp: any[] = [];
  thresholdListModel.value.forEach((mode: any) => {
    const modeTmp = cloneObject(mode)
    const oldMode = props.thresholdList ?
        props.thresholdList.find(item => item.id === modeTmp.id) :
        false;
    if (!oldMode) {
      modeTmp.temperatureThresholds = defaultLevels.map((levelItem) => ({
        maxTemperature: 0,
        thresholdType: mode.id,
        level: levelItem.level
      }))
      listModeTmp.push(modeTmp)
    } else {
      listModeTmp.push(oldMode)
    }
  })
  emits("update:thresholdList", listModeTmp)
}
</script>
<style scoped>
.threshold-tabs {
  display: flex;
  gap: 30px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
  position: relative;
}

.th-tab {
  padding: 12px 0;
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.th-tab.active {
  color: #3b82f6;
}

.th-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.filter-badge {
  background: #1e293b;
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 4px;
  z-index: 10;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  display: none;
  flex-direction: column;
  gap: 16px;
  z-index: 100;
  animation: fdFadeIn 0.2s ease-out;
}

@keyframes fdFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-dropdown.show {
  display: flex;
}

.fd-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.fd-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.fd-header-actions a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
}
</style>