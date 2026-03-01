<template>
  <slot :data="data" :error="error" :reload="fetch" :loading="isLoading"/>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import useRequest from "@/hooks/web/useRequest";

export interface DataFetcherProps {
  requestFn: (...args: unknown[]) => Promise<unknown>;
  immediate?: boolean;
  params?: Record<string, unknown>;
}

const props = withDefaults(defineProps<DataFetcherProps>(), {
  immediate: true,
  params: () => ({})
});

const data = ref();
const error = ref<string | null>(null);

const {onRequest, isLoading} = useRequest({
  onError: () => {
    error.value = "Failed to load data.";
  },
});

const fetch = async () => {
  isLoading.value = true;
  error.value = "";
  const response = await onRequest(props.requestFn, props.params);
  data.value = response.data;
};

onMounted(() => {
  if (props.immediate) {
    fetch();
  }
});

defineExpose({
  fetch,
});
</script>
