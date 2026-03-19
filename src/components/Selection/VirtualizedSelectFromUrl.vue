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
      @change="handleChange"
  >
  </el-select-v2>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useConfigStore} from '@/store/modules/configStore'

const configStore = useConfigStore()
const modelValue = defineModel<any>('modelValue', {required: true})
const loading = ref(true)
const optionMap = ref(new Map<any, any>())
const emit = defineEmits(['selected', 'change'])

const props = defineProps({
  requestFn: {
    type: Function,
    required: true,
  },
  colValue: {type: String, required: false, default: 'id'},
  colLabel: {type: String, required: false, default: 'name'},
})
const options = ref<any[]>([])
const fetch = async () => {
  const res = await props.requestFn()
  options.value = configStore.convertOptions(res.data, props.colValue, props.colLabel)
  optionMap.value = new Map(
      res.data.map((i: any) => [i[props.colValue], i])
  )
  loading.value = false
}

const handleChange = (val: any) => {
  const selected = optionMap.value.get(val)
  emit('selected', selected)
  emit('change', selected[props.colValue])
}

onMounted(async () => {
  await fetch()
})

defineExpose({
  fetch,
})
</script>
