<template>
  <el-select
    v-model="modelValue"
    remote-show-suffix
    v-bind="$attrs"
    v-load-more="loadMore"
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
import { onMounted, ref } from 'vue'
import vLoadMore from './vLoadMore'

const props = defineProps({
  modelValue: { type: [String, Number, Array], required: false },
  requestFn: { type: Function, required: true },
  colLabel: { type: String, required: false, default: 'name' },
  colValue: { type: String, required: false, default: 'id' },
  appendQuery: { type: [Object], required: false },
})

onMounted(() => {
  init()
})

const options = ref<object[]>([])
const loading = ref(false)
const page = ref(1)

const modelValue = defineModel<any>('modelValue', { required: true })

const init = async () => {
  remoteMethod()
}
const loadMore = () => {
  if (page.value && !loading.value) {
    page.value = page.value + 1
    remoteMethod()
  }
}

const remoteMethod = () => {
  if (loading.value === false) {
    loading.value = true
    props
      .requestFn({
        page: page.value,
        ...props.appendQuery,
      })
      .then((res: any) => {
        let data = res.data.items
        options.value = options.value.concat(data)
        if (res.data.pageIndex >= res.data.totalPages) {
          page.value = 0
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
}
</script>
