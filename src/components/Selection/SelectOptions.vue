<template>
  <el-select
      v-model="modelValue"
      remote-show-suffix
      v-bind="$attrs"
  >
    <el-option
        v-for="item in optionValues"
        :key="item[colValue]"
        :label="item[colLabel]"
        :value="item[colValue]"
    >
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>

import {computed} from "vue";

const props = defineProps({
  modelValue: {required: false},
  options: {type: Array, required: true},
  colLabel: {type: String, required: false, default: 'name'},
  colValue: {type: String, required: false, default: 'id'},
})

const optionValues = computed(() =>
    (props.options ?? []).filter(
        (item) => item !== null && item !== undefined
    )
);
const modelValue = defineModel<any>('modelValue', {required: true})

</script>
