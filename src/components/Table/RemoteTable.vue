<template>
  <base-table
      :columns="columns"
      :data="data"
      :loading="isLoading"
  ></base-table>
</template>
<script setup lang="ts">
import BaseTable from "@/components/Table/BaseTable.vue";
import type {TableColumn} from "@/components/Table/types";
import {onMounted, PropType, ref} from "vue";
import useRequest from "@/hooks/web/useRequest";

const props = defineProps({
  columns: {
    type: Array as () => TableColumn[],
    default: () => [],
  },
  requestFn: {
    type: Function as PropType<(...args: any[]) => Promise<any>>,
    required: true,
  },
  immediate: {
    type: Boolean,
    default: true,
    required: false
  }
})
const data = ref([])

const {onRequest, isLoading} = useRequest();

const fetch = () => {
  onRequest(props.requestFn).then(res => {
    data.value = res.data;
  })
}
onMounted(() => {
  if (props.immediate) {
    fetch()
  }
})

defineExpose({
  fetch,
})
</script>