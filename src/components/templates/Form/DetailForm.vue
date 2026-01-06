<template>
  <el-card class="page-card">
    <template #header>
      <div class="card-header">
        <span>{{ props?.title }}</span>
      </div>
    </template>
    <el-skeleton :loading="loading" animated>
      <GenericForm
        :form-model="defaultValues"
        :component="props.component"
        :requestFn="(data: unknown) => saveRequest(id, data)"
        v-bind="$attrs"
      />
    </el-skeleton>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, type Component } from "vue";
import { useRoute } from "vue-router";
import GenericForm from "@/components/templates/Form/GenericForm.vue";

const route = useRoute();
const id = ref<string>(<string>route.params.id ?? "");

const loading = ref(false);

interface FormComponentProps {
  title?: string;
  formModel?: any;
  component: Component;
  transformDetailData?: (data: unknown) => unknown;
  detailRequest: (id: string) => Promise<IResponse<unknown>>;
  saveRequest: (id: string, data: unknown) => Promise<IResponse<unknown>>;
}

const props = defineProps<FormComponentProps>();
const defaultValues = ref(props.formModel ?? {});

async function load() {
  loading.value = true;
  try {
    const res = await props.detailRequest(id.value);
    const raw = res.data;
    const formData = props.transformDetailData
      ? props.transformDetailData(raw)
      : raw;
    defaultValues.value = { ...props.formModel, ...(formData as object) };
  } catch {
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
