<template>
  <div class="relative inline-block">
    <el-button
        :type="point && point.comparationModeObjectList?.length ? 'success': ''"
        class="pr-6"
    >
      {{ point.name }}
    </el-button>
    <button
        type="button"
        @click="emits('remove')"
        class="absolute -top-1 -right-1 bg-white rounded-full border border-gray-300 hover:bg-red-500 hover:text-white p-0 w-[20px] h-[20px] cursor-pointer"
    >
      <el-icon size="12">
        <Close/>
      </el-icon>
    </button>
  </div>
</template>

<script setup>
import {ElButton, ElIcon} from 'element-plus'
import {Close} from '@element-plus/icons-vue'

const emits = defineEmits(['remove'])
defineProps({
  point: {
    type: Object,
  },
})
</script>
