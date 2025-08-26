<script setup>
defineProps({
  label: String,
  fromModel: String | Number,
  fromText: String,
  toText: String,
  color: String,
  readonly: {
    type: Boolean,
    default: false
  },
})

const toModel = defineModel('toModel', { required: true })
</script>

<template>
  <div class="flex flex-wrap items-center">
    <div class="w-1/4">
      <div class="box-item text-white p-2 text-center" :class="color">{{ label }}</div>
    </div>
    <div class="w-1/4 flex items-center space-x-2">
      <span class="text-center w-[30px]">Từ:</span>
      <span>{{ fromModel }}</span>
      <span class="text-center w-[30px]">{{ fromText }}</span>
    </div>
    <div class="w-1/2 flex items-center space-x-2">
      <span class="ml-2 text-center w-[30px]">Đến:</span>
      <span class="text-center w-[30px]">{{ toText }}</span>
      <el-input-number
        v-model="toModel"
        :controls="true"
        class="flex-1"
        controls-position="right"
        :readonly="readonly"
      />
    </div>
  </div>
</template>
