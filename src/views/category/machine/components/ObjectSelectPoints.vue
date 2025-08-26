<template>
  <el-select
      v-model="modelValue"
      :value-key="colValue"
      v-bind="$attrs"
      @focus="changeHandler"
  >
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
  formModel: {
    type: Object,
    required: true,
  },
  fieldPoint: {
    type: String,
    required: true,
  },
  exceptPoints: {
    type: [Array<any>],
    required: true,
  },
  colValue: {type: String, required: false, default: 'id'},
  colLabel: {type: String, required: false, default: 'name'},
  colDisabled: {type: String, required: false, default: 'used'},
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
  applyDisabled()
  loading.value = false
}

const changeHandler = () => {
  applyDisabled()
}
const applyDisabled = () => {
  const dictMachineParts: Record<string, any> = props.formModel?.dictMachineParts || {};
  const ids: number[] = Object.values(dictMachineParts)
      .flatMap(part => part.machineComponents)
      .flatMap(component => component[props.fieldPoint])
      .map(point => point.id);
  const exceptIds = props.exceptPoints?.map(point => point.id);
  const disableIds = ids.filter(item => !exceptIds.includes(item));
  setDisabled(disableIds)
}


const setDisabled = (ids: number[]) => {
  options.value = options.value.map((option: any) => {
    if(option[props.colDisabled]) {
      return option;
    }
    return {
      ...option,
      [props.colDisabled]: ids.includes(option[props.colValue]),
    }
  })
}

defineExpose({
  fetch,
  applyDisabled
})
</script>
