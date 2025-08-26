<template>
  <el-select-v2
      v-model="modelValue"
      :options="options"
      :props="{
      value: colValue,
      label: colLabel,
    }"
      :loading="loading"
      :disabled="loading"
      v-bind="$attrs"
  >
  </el-select-v2>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useConfigStore} from '@/store/modules/configStore'

const configStore = useConfigStore()
const modelValue = defineModel<any>('modelValue', {required: true})
const loading = ref(true)
const props = defineProps({
  requestFn: {
    type: Function,
    required: true,
  },
  colValue: {type: String, required: false, default: 'id'},
  colLabel: {type: String, required: false, default: 'name'},
})
const options = ref([])
const fetch = async () => {
  const res = await props.requestFn()
  options.value = configStore.convertOptions(res.data, props.colValue, props.colLabel)
  loading.value = false
}
onMounted(async () => {
  await fetch()
})

defineExpose({
  fetch,
})
</script>
