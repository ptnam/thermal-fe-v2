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
          :icon="Setting"
          color="#F0F2F5"
          @click="showDialogSetting"
      ></el-button>
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
import { Setting } from '@element-plus/icons-vue'
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
