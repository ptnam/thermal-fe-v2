<template>
  <el-input
    v-model="displayValue"
    inputmode="numeric"
    pattern="[0-9]*"
    v-bind="$attrs"
    @change="handleChange"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  min: Number,
  max: Number,
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'blur'
])

const internal = ref('')

watch(
  () => props.modelValue,
  (v) => {
    internal.value = v?.toString() ?? ''
  },
  { immediate: true }
)

const displayValue = computed({
  get() {
    return internal.value
  },
  set(val: string) {
    let clean = val.replace(/[^0-9]/g, '')

    if (props?.maxlength) {
      clean = clean.slice(0, props?.maxlength)
    }

    let num = clean ? Number(clean) : null

    if (num !== null) {
      if (props.min !== undefined && num < props.min) num = props.min
      if (props.max !== undefined && num > props.max) num = props.max
    }

    internal.value = num !== null ? String(num) : ''
    emit('update:modelValue', num)
  }
})

const handleChange = () => {
  emit('change', displayValue.value)
}

const handleBlur = () => {
  emit('blur', displayValue.value)
}
</script>