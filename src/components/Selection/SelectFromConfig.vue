<template>
  <el-select v-model="modelValue" v-bind="$attrs">
    <el-option
        v-for="item in options"
        :key="item[colValue]"
        :label="optionLabel(item)"
        :value="item[colValue]"
    />
  </el-select>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useConfigStore} from '@/store/modules/configStore'
import {enumLabel} from '@/utils/enumLabel'

const configStore = useConfigStore()
const modelValue = defineModel<any>('modelValue', {required: true})
const props = defineProps({
  keyConfig: {type: String, required: true},
  colLabel: {type: String, required: false, default: 'name'},
  colValue: {type: String, required: false, default: 'id'},
  filter: {type: Function, required: false},
})
const options = ref<any[]>([])

const reloadOption = () => {
  options.value = configStore.convertToSelect(props.keyConfig, props.colValue, props.colLabel, props.filter)
}

// Nhãn enum dịch theo mã (nhóm = keyConfig, xem locales/*/enums.ts); danh mục từ DB giữ nguyên
const optionLabel = (item: any) => {
  const raw = Object.values(configStore.getConfig(props.keyConfig) ?? {})
      .find((c: any) => c[props.colValue] === item[props.colValue]) as any
  return enumLabel(props.keyConfig, raw?.code, item[props.colLabel])
}

onMounted(() => {
  reloadOption()
})

defineExpose({
  reloadOption
})
</script>
