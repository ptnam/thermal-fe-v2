<template>
  <el-form ref="refForm" :model="model" v-bind="mergedFormProps">
    <div class="mt-2">
      <slot
        :loading="loading"
        :formErrors="formErrors"
        :submit="submitForm"
        :model="model"
      />
    </div>

    <div
      v-if="mergedFormProps.visibleButtonSlot"
      class="mt-4 w-full text-center"
    >
      <slot name="button">
        <div>
          <CancelButton @click="emits('onCancel')" />
          <SaveButton :loading="loading" @click="submitForm" />
        </div>
      </slot>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import { ref, computed, unref } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import type { ActionFormProps } from "@/components/templates/Form/types.ts";
import { useSimpleFormRequest } from "@/hooks/web/useSimpleFormRequest";
import CancelButton from "@/components/Button/CancelButton.vue";
import SaveButton from "@/components/Button/SaveButton.vue";

const { t } = useLang()

type TModel = Record<string, never>;

const props = defineProps<ActionFormProps>();

const emits = defineEmits(["onSuccess", "onCancel"]);

const mergedFormProps = computed(() => ({
  labelPosition: "left",
  validateOnRuleChange: false,
  requireAsteriskPosition: "right",
  visibleButtonSlot: true,
  labelWidth: "auto",
  messageSuccess: t('common.saveSuccess'),
  ...props.formProps,
}));

const refForm = ref<FormInstance>();
const { model, loadModel, formErrors, submit, loading } =
  useSimpleFormRequest<TModel>();

loadModel(props.formModel as Partial<TModel>);

async function submitForm() {
  let isValid: boolean;
  try {
    isValid = (await refForm.value?.validate()) ?? false;
  } catch {
    isValid = false;
  }
  if (!isValid) return;

  const base = { ...unref(model) };
  const payload = (
    props.transformSaveData ? props.transformSaveData(base) : base
  ) as never;

  const result = await submit(props.requestFn!, payload);
  if (result.success) {
    ElMessage.success(mergedFormProps.value.messageSuccess);
    emits("onSuccess", result.data);
  }
}
</script>
