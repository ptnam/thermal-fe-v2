<template>
  <el-select
      v-model="modelValue"
      remote-show-suffix
      v-bind="$attrs"
  >
    <el-option
        v-for="item in options"
        :key="item[colValue]"
        :label="item[colLabel]"
        :value="item[colValue]"
    >
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>

 defineProps({
  modelValue: {type: [String, Number, Array], required: false},
  options: {required: true},
  colLabel: {type: String, required: false, default: 'name'},
  colValue: {type: String, required: false, default: 'id'},
})

const modelValue = defineModel<any>('modelValue', {required: true})

</script>
