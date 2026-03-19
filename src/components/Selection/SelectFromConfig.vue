<template>
  <el-select v-model="modelValue" v-bind="$attrs">
    <el-option
        v-for="item in options"
        :key="item[colValue]"
        :label="item[colLabel]"
        :value="item[colValue]"
    />
  </el-select>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useConfigStore} from '@/store/modules/configStore'

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

onMounted(() => {
  reloadOption()
})

defineExpose({
  reloadOption
})
</script>
