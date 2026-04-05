<template>
  <div class="page-info-bar ">
    <p class="mt-2">Hiển thị từ {{rowIndex}} đến {{lastRowIndex}} trong tổng số {{total}}</p>
    <div class="pagination-group flex gap-2">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          size="default"
          :background="true"
          layout="sizes, prev, pager, next, ->, jumper"
          :total="total"
      />
      <el-button
          class="btn-page"
          v-show="paginationSetting"
          color="#F0F2F5"
          @click="showDialogSetting"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
          </path>
        </svg>
      </el-button>
      <el-dialog v-model="dialogVisible" :center="true"    align-center draggable>
        <template v-slot:header>Danh sách cột</template>
        <template v-slot:default>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <template v-for="(col, index) in columns" :key="index">
              <div
                  v-if="col && col.prop && col.label"
                  class="flex items-center justify-between p-4 border rounded"
              >
                <span class="text-sm font-medium">{{ col.label }}</span>
                <el-switch v-model="props.paginationSetting[col.prop]" />
              </div>
            </template>
          </div>
        </template>
        <template v-slot:footer>
          <cancel-button @click="hideDialogSetting"></cancel-button>
          <save-button @click="save"></save-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SaveButton from '@/components/Button/SaveButton.vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import { usePaginationStore } from '@/store/modules/paginationStore'

const currentPage = defineModel<number>('currentPage', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

// One-way prop
const props = defineProps({
  total: { type: Number, required: false, default: 0 },
  rowIndex: { type: Number, required: false, default: 0 },
  lastRowIndex: { type: Number, required: false, default: 0 },
  paginationSetting: { type: Object, required: false, default: {} },
  columns: { type: Object, required: false },
  keyList: { type: String, required: true },
})

const dialogVisible = ref(false)

const showDialogSetting = () => {
  dialogVisible.value = true
}
const hideDialogSetting = () => {
  dialogVisible.value = false
}

const emits = defineEmits(['saveSuccess'])
const save = () => {
  const paginationStore = usePaginationStore()
  paginationStore.save({ pageCode: props.keyList, pageColumns: props.paginationSetting })
  emits('saveSuccess', props.paginationSetting)
  hideDialogSetting()
}
</script>
