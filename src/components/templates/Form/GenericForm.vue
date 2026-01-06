<script setup lang="ts">
import { useAttrs, type Component } from "vue";
import type { ActionFormProps } from "@/components/templates/Form/types.ts";

export interface FormComponentProps extends ActionFormProps {
  formModel: any;
  component: Component;
  onLoaded?: (data: any) => void;
  [key: string]: unknown;
}

const props = defineProps<FormComponentProps>();
const attrs = useAttrs();
</script>

<template>
  <component
    :is="props.component"
    v-bind="props"
    v-on="attrs"
    :formModel="props.formModel"
  />
</template>
