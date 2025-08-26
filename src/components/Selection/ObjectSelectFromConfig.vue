<template>
  <el-select v-model="modelValue" value-key="id" v-bind="$attrs">
    <el-option
      v-for="item in options"
      :key="item[optionKey]"
      :label="item[colLabel]"
      :value="item"
      v-bind="$attrs"
    />
  </el-select>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useConfigStore } from '@/store/modules/configStore'

const configStore = useConfigStore()
const modelValue = defineModel<any>('modelValue', { required: true })
const props = defineProps({
  keyConfig: { type: String, required: true },
  colLabel: { type: String, required: false, default: 'name' },
  optionKey: { type: String, required: false, default: 'id' },
})
const options = ref([])

onMounted(() => {
  options.value = configStore.getConfig(props.keyConfig) ?? []
})
</script>
