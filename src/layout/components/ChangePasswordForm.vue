<script setup lang="ts">
import { computed } from "vue";
import ActionForm from "@/components/templates/Form/ActionForm.vue";
import type { FormRules } from "element-plus";
import type { ActionFormProps } from "@/components/templates/Form/types.ts";
import { rule } from '@/utils/validate'
import { useLang } from "@/hooks/web/useI18n";

const { t } = useLang()

const props = defineProps<ActionFormProps>();


const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    currentPassword: [rule("required", true, "currentPassword"), rule("min", 6, "currentPassword")],
    newPassword: [rule("required", true, "newPassword"),  rule("min", 6, "newPassword")],
  };
  return rules;
});
</script>
<template>
  <ActionForm v-bind="props" :form-props="{ rules: formRules, labelPosition: 'top' }">
    <template v-slot="{ model, formErrors }">
      <el-form-item
        :label="t('user.fields.currentPassword')"
        prop="currentPassword"
        :error="formErrors.CurrentPassword"
      >
        <el-input v-model="model.currentPassword" type="password" />
      </el-form-item>
      <el-form-item
        :label="t('user.fields.newPassword')"
        prop="newPassword"
        :error="formErrors.NewPassword"
      >
        <el-input v-model="model.newPassword" type="password" />
      </el-form-item>
    </template>
  </ActionForm>
</template>
