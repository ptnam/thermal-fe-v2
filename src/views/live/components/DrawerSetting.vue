<script setup lang="ts">
import {getAllTreeAreaApi} from "@/api/area";
import SimpleAreaTree from "@/components/Tree/SimpleAreaTree.vue";
import {computed, ref, watch} from 'vue'
import {BaseTable} from "@/components/Table/index";
import {vDraggable} from "@/components/Table/v-draggable";
import {updateCameraSettingApi} from "@/api/camera-setting";
import {CAMERA_COMMANDS} from "@/constants";
import {cloneObject} from "@/utils/objectUtils";

const emit = defineEmits([
  'close',
  'treeChange',
  'updatePage',
  'applySettings'
])

const props = defineProps({
  listMarked: {
    type: Array<any>,
    required: true
  },
  screenNumber: {
    type: Number,
    required: false
  },
})

const loadingSetting = ref(false)

const selectedIds = computed(() => props.listMarked.map(u => u.id));
const dragList = ref([]);
watch(
    () => props.listMarked,
    (value) => {
      dragList.value = value as []
    },
    {immediate: true}
)

const dragOptions = [
  {
    selector: "tbody", // add drag support for row
    handle: '.el-table__row',
    option: { // sortablejs's option
      animation: 150,
      onEnd: (evt: { oldIndex: number; newIndex: number; }) => {
        const newList = arrayMoveInPlace(cloneObject(props.listMarked), evt.oldIndex, evt.newIndex)
        emit("treeChange", newList)
      },
    },
  },
];
const changeGrid = (cells) => {
  const grid = document.getElementById('mainCamGrid');
  if (grid) {
    emit("updatePage", cells)
  }
}

const columns = [
  {prop: 'id', label: "ID", width: 60,},
  {prop: 'code', label: "Mã camera"},
  {prop: 'name', label: "Tên camera"},
];
const arrayMoveInPlace = (array: any[], fromIndex: number, toIndex: number) => {
  const [movedItem] = array.splice(fromIndex, 1);
  array.splice(toIndex, 0, movedItem);
  return array;
}

const treeRef = ref()
const treeCheckChange = (r: { mapType: any; }) => {
  if (!r.mapType) {
    emit('treeChange', treeRef?.value?.treeRef.getCheckedNodes().filter(item => !item.mapType))
  }
}

const applySettings = () => {
  loadingSetting.value = true;
  updateCameraSettingApi({
    flagCommand: CAMERA_COMMANDS.ALL,
    cameraIds: (props.listMarked as Array<{ id: number }>).map(item => item.id),
    screenNumber: props.screenNumber
  }).then((res) => {
    emit('applySettings', res.data);
  }).finally(() => {
    loadingSetting.value = false;
  })
}
</script>
<template>
  <div class="drawer drawer-md" id="settingsDrawer">
    <div class="drawer-header">
      <h3>Thiết lập hiển thị</h3>
      <button class="close-drawer" @click="()=>emit('close')">×</button>
    </div>
    <div class="drawer-body">
      <div class="settings-section">
        <div class="settings-title">KHU VỰC</div>
        <div class="settings-tree">
          <simple-area-tree
              ref="treeRef"
              show-checkbox
              :request-fn="() => getAllTreeAreaApi({ cameras: true })"
              :check-strictly="true"
              :default-checked-ids="selectedIds"
              @check-change="treeCheckChange"
          >
            <template #default="{ node }">
              <div class="st-item">
                <label class="st-label">
                  <svg v-if="node.data.mapType" width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z">
                    </path>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  <span>{{ node.data.name }}</span>
                </label>
              </div>
            </template>
          </simple-area-tree>
        </div>
      </div>
      <hr class="drawer-divider">
      <div class="settings-section">
        <div class="settings-title">KIỂU BỐ CỤC</div>
        <div class="layout-picker">
          <div :class="['layout-option', screenNumber === 1 ? 'active': '']" @click="()=>changeGrid(1)">
            <div class="grid-icon"
                 style="width:24px; height:18px; border:1.5px solid currentColor; border-radius:3px; opacity:0.6;">
            </div>
          </div>
          <div :class="['layout-option', screenNumber === 2 ? 'active': '']" @click="()=>changeGrid(2)">
            <div class="grid-icon" style="display:flex; gap:3px;">
              <div style="width:11px; height:18px; border:1.5px solid currentColor; border-radius:2px; opacity:0.6;">
              </div>
              <div style="width:11px; height:18px; border:1.5px solid currentColor; border-radius:2px; opacity:0.6;">
              </div>
            </div>
          </div>
          <div :class="['layout-option', screenNumber == 4 ? 'active': '']" @click="()=>changeGrid(4)">
            <div class="grid-icon" style="display:grid; grid-template-columns:1fr 1fr; gap:3px;">
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
              <div style="width:11px; height:8px; border:1.5px solid currentColor; border-radius:2px;">
              </div>
            </div>
          </div>
          <div :class="['layout-option', screenNumber == 9 ? 'active': '']" @click="()=>changeGrid(9)">
            <div class="grid-icon" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:2px;">
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
              <div style="width:7px; height:5px; border:1px solid currentColor; border-radius:1px; opacity:0.6;">
              </div>
            </div>
          </div>
        </div>

        <div class="settings-title" style="margin-top: 30px;">THỨ TỰ CAMERA (KÉO ĐỂ ĐỔI)</div>
        <div v-if="listMarked.length" class="cam-order-list">
          <base-table
              class="mt-4"
              row-key="id"
              :data="listMarked"
              :columns="columns"
              v-draggable="dragOptions"/>
        </div>
      </div>
    </div>
    <div class="drawer-footer"
         style="padding: 20px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px;">
      <button class="btn-cancel" @click="()=>emit('close')"
              style="padding: 10px 24px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-sub); cursor: pointer; font-weight: 600;">
        Hủy
      </button>
      <el-button
          :loading="loadingSetting"
          class="btn-save"
          @click="applySettings"
          style="height: 42px;padding: 10px 24px; border-radius: 8px; border: none; background: var(--primary); color: white; cursor: pointer; font-weight: 700;">
        Lưu thiết lập
      </el-button>
    </div>
  </div>
</template>
<style scoped>
.settings-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sub);
  margin-bottom: 12px;
  text-transform: uppercase;
}

.st-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-main);
}

.st-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary);
}

.st-label svg {
  color: var(--text-sub);
}

.layout-option {
  width: 60px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  color: var(--text-sub);
}

.layout-option.active {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary);
}
</style>