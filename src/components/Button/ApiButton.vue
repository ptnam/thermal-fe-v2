<template>
  <el-button
      @click="handleClick"
      :loading="isLoading"
      :icon="icon"
      :color="color"
      :round="round"
      :circle="circle"
      v-bind="$attrs"
  >
    <slot></slot>
  </el-button>
</template>

<script lang="ts" setup>
import useRequest from "@/hooks/web/useRequest";

type ApiFn<T = any> = (...args: any[]) => Promise<T>;

interface Props<T = any> {
  api: ApiFn<T>;
  args?: any[];
  onSuccess?: (response: T) => void;
  onError?: (error: unknown) => void;
  icon?: any
  color?: any
  round?: any
  circle?: any
}

const props = defineProps<Props>();

const { onRequest, isLoading } = useRequest({
  onSuccess: props.onSuccess,
  onError: props.onError,
});

const handleClick = () => {
  onRequest(props.api, ...(props.args ?? []));
};
</script>
