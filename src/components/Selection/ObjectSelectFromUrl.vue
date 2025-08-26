<template>
  <el-select
      v-model="modelValue" :value-key="colValue" v-bind="$attrs">
    <el-option
        v-for="item in options"
        :key="item[colValue]"
        :label="item[colLabel]"
        :value="item"
        :disabled="item[colDisabled]"
    >
    </el-option>
  </el-select>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue'

const modelValue = defineModel<any>('modelValue', {required: true})
const loading = ref(true)
const props = defineProps({
  requestFn: {
    type: Function,
    required: true,
  },
  colValue: {type: String, required: false, default: 'id'},
  colLabel: {type: String, required: false, default: 'name'},
  colDisabled: {type: String, required: false, default: 'disabled'},
  immediate: {type: Boolean, required: false, default: true},
})
const options = ref<any[]>([])

onMounted(async () => {
  if (props.immediate) {
    await fetch()
  }
})

const fetch = async () => {
  const res = await props.requestFn()
  options.value = res.data
  loading.value = false
}

const applyDisabled = (ids: number[]) => {
  options.value = options.value.map((option: any) => ({
    ...option,
    [props.colDisabled]: ids.includes(option[props.colValue]),
  }))
}

defineExpose({
  fetch,
  applyDisabled
})
</script>
