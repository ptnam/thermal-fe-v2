<script setup lang="ts">
import {computed} from 'vue'

interface Option {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: Option[]
  options: Option[]
}>()

const emit = defineEmits(['update:modelValue', 'change'])

// 👉 convert qua lại giữa object <-> id
const selectedIds = computed<string[]>({
  get: () => props.modelValue.map(i => i.id),
  set: (ids: string[]) => {
    const selected = props.options.filter(o => ids.includes(o.id))
    emit('update:modelValue', selected)
    emit('change', selected)
  }
})

// select all
const isAllSelected = computed(() => {
  return selectedIds.value.length === props.options.length
})

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = props.options.map(o => o.id)
  }
}
</script>

<template>
  <el-dropdown trigger="click">
    <!-- Button -->
    <span class="el-dropdown-link cursor-pointer">
      <el-button size="small">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
        Bộ lọc ({{ selectedIds.length }})
      </el-button>
    </span>

    <!-- Dropdown -->
    <template #dropdown>
      <div class="p-3 w-[260px]">
        <!-- Header -->
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold text-sm">Loại ngưỡng</span>
          <el-link type="primary" @click="toggleAll" :underline="false">
            {{ isAllSelected ? 'Bỏ chọn' : 'Chọn tất cả' }}
          </el-link>
        </div>

        <!-- Checkbox group -->
        <el-checkbox-group v-model="selectedIds" class="flex flex-col gap-2">
          <el-checkbox
              v-for="item in options"
              :key="item.id"
              :label="item.id"
          >
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </template>
  </el-dropdown>
</template>