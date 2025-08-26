<template>
  <el-input
      v-model="inputValue"
      :formatter="(value) => value.replace(/[^0-9]/g, '')"
      @change.native="handleChange"
      @blur.native="handleBlur"
      v-bind="$attrs"
  />
</template>
<script lang="ts" setup>
import {computed, ref, useAttrs} from 'vue'
const hasChange = ref(false);
const props = defineProps({
  modelValue: {type: [String, Number], required: false},
})

const emits = defineEmits(['update:modelValue', "changeBlur"])

const handleChange = () => {
  hasChange.value = true
}

const handleBlur = () => {
  emits('changeBlur', inputValue.value)
  hasChange.value = false
}


const inputValue = computed<any>({
  get() {
    return props.modelValue ?? useAttrs().value
  },
  set(value) {
    emits('update:modelValue', value)
  }
})

</script>
