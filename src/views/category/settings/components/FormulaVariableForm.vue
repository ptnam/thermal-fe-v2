<template>
  <FormWrapper
      ref="formRef"
      :form-model="formModel"
      :form-props="{ labelWidth: '160px', labelPosition: 'top' }"
      :request-fn="isEditing ? editFormulaVariableApi : addFormulaVariableApi"
      :isEditing="isEditing"
      :transform-form-data="transformFormData"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <div v-if="isEditing && formModel.inUse" class="in-use-notice">
        {{ t('formula.variable.inUseNotice') }}
      </div>
      <el-form-item
          :label="t('formula.variable.nameLabel')"
          prop="name"
          :error="formErrors.Name || nameFormatError"
      >
        <el-input v-model="formModel.name" :disabled="isEditing || isLocked" @blur="onNameBlur"/>
        <div class="field-hint">{{ t('formula.variable.nameHint') }}</div>
      </el-form-item>
      <el-form-item :label="t('formula.displayLabel')" prop="label" :error="formErrors.Label">
        <el-input v-model="formModel.label" :disabled="isLocked"/>
      </el-form-item>
      <el-form-item :label="t('fields.status')" prop="status" :error="formErrors.Status">
        <el-select v-model="formModel.status" :disabled="isLocked">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value"/>
        </el-select>
      </el-form-item>

      <el-form-item :label="t('formula.aggregate')">
        <el-select v-model="formModel.aggregateFunction" :disabled="isLocked">
          <el-option v-for="o in aggregateFunctionOptions" :key="o.value" :label="o.label" :value="o.value"/>
        </el-select>
      </el-form-item>
      <template v-if="isAutoVariable && !isCurrentAggregate">
        <el-form-item :label="t('formula.timeRange')">
          <el-select v-model="formModel.scopeType" :disabled="isLocked">
            <el-option v-for="o in scopeTypeOptions" :key="o.value" :label="o.label" :value="o.value"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="needsScopeN" :label="scopeNLabel">
          <el-input-number v-model="formModel.scopeN" :min="1" :disabled="isLocked" class="!w-full"/>
        </el-form-item>
        <el-form-item v-if="formModel.scopeType === SCOPE_FIXED_DATE" :label="t('alert.fromDate')">
          <el-date-picker
              v-model="formModel.scopeFixedDate"
              type="date"
              :placeholder="t('formula.variable.pickDate')"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              :disabled="isLocked"
              class="!w-full"
          />
        </el-form-item>

        <template v-if="formModel.scopeType !== SCOPE_LAST_N_READINGS">
          <el-form-item :label="t('formula.variable.endPoint')">
            <el-select v-model="formModel.scopeEndType" :disabled="isLocked">
              <el-option v-for="o in scopeEndTypeOptions" :key="o.value" :label="o.label" :value="o.value"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="needsScopeEndN" :label="scopeEndNLabel">
            <el-input-number v-model="formModel.scopeEndN" :min="1" :disabled="isLocked" class="!w-full"/>
          </el-form-item>
          <el-form-item v-if="formModel.scopeEndType === SCOPE_END_FIXED_DATE" :label="t('alert.toDate')">
            <el-date-picker
                v-model="formModel.scopeEndFixedDate"
                type="date"
                :placeholder="t('formula.variable.pickDate')"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                :disabled="isLocked"
                class="!w-full"
            />
          </el-form-item>
        </template>
      </template>

      <el-form-item :label="t('formula.variable.meaning')" prop="description" :error="formErrors.Description">
        <el-input v-model="formModel.description" type="textarea" :rows="2" :disabled="isLocked"/>
      </el-form-item>

      <div v-if="isAutoVariable" class="preview-block">
        <el-form-item :label="t('formula.variable.previewEquipment')">
          <el-select v-model="previewMachineId" filterable clearable @change="onMachineChange">
            <el-option v-for="o in machineOptions" :key="o.value" :label="o.label" :value="o.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('alert.component')">
          <el-select v-model="previewMachineComponentId" filterable clearable :disabled="!previewMachineId">
            <el-option v-for="o in machineComponentOptions" :key="o.value" :label="o.label" :value="o.value"/>
          </el-select>
        </el-form-item>
        <div class="preview-block__actions">
          <el-button :loading="previewLoading" :disabled="!previewMachineComponentId" @click="onPreview">{{ t('formula.variable.previewValue') }}</el-button>
          <span v-if="previewResult" class="preview-block__result">
            {{ previewResult.hasData ? t('formula.variable.value', { value: previewResult.value }) : previewResult.message || t('pd.noData') }}
          </span>
        </div>
      </div>
    </template>
    <template #button>
      <div class="mt-4 w-full flex justify-between">
        <cancel-button @click="formRef?.triggerCancel()"></cancel-button>
        <save-button :loading="formRef?.loading" :disabled="isLocked" @click="formRef?.submitForm()"></save-button>
      </div>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import FormWrapper from '@/components/Form/FormWrapper.vue'
import SaveButton from '@/components/Button/SaveButton.vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import { computed, ref, watch } from 'vue'
import { isFormEditing } from '@/utils/is'
import { addFormulaVariableApi, editFormulaVariableApi, previewFormulaVariableApi } from '@/api/formula'
import { getAllMachineApi, getComponentMachineApi } from '@/api/machine'
import {
  AGGREGATE_FUNCTION_OPTIONS as aggregateFunctionOptions,
  NONE_AGGREGATE_FUNCTION,
  CURRENT_AGGREGATE_FUNCTION,
  SCOPE_TYPE_OPTIONS as scopeTypeOptions,
  SCOPE_N_LABELS,
  nLabelFallback,
  SCOPE_TYPES_NEEDING_N,
  SCOPE_FIXED_DATE,
  SCOPE_LAST_N_READINGS,
  LEVEL_DB_SOURCE_COLUMN,
  SCOPE_END_TYPE_OPTIONS as scopeEndTypeOptions,
  SCOPE_END_N_LABELS,
  SCOPE_END_TYPES_NEEDING_N,
  SCOPE_END_FIXED_DATE,
} from '../pdFormulaVariableOptions'

const { t } = useLang()

// Hiện chỉ có Domain=1 (Pd) - xem FormulaDomain (BE, Enums.cs).
const PD_DOMAIN = 1

// Tên biến dùng trực tiếp làm tên tham số NCalc - validate khớp ĐÚNG regex bên BE
// (FormulaController.ValidVariableName) để báo lỗi ngay trên form thay vì đợi API trả 400.
const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/
const nameFormatError = ref('')
function onNameBlur() {
  const name = String(props.formModel.name ?? '').trim()
  nameFormatError.value = !name || VARIABLE_NAME_PATTERN.test(name)
    ? ''
    : t('formula.variable.nameFormatError')
}

const props = defineProps({
  formModel: {
    type: Object as () => {
      id?: number
      domain?: number
      name?: string
      label?: string
      description?: string
      status?: number
      sourceColumn?: number | null
      aggregateFunction?: number | null
      scopeType?: number | null
      scopeN?: number | null
      scopeFixedDate?: string | null
      scopeEndType?: number | null
      scopeEndN?: number | null
      scopeEndFixedDate?: string | null
      inUse?: boolean
    },
    required: true,
  },
})
const emit = defineEmits<(e: 'success', data: any) => void>()

const formRef = ref<InstanceType<typeof FormWrapper>>()
const isEditing = computed(() => isFormEditing(props.formModel))
const isLocked = computed(() => !!(isEditing.value && props.formModel.inUse))
if (!props.formModel.domain) props.formModel.domain = PD_DOMAIN
if (props.formModel.status == null) props.formModel.status = 1
// Select cần 1 giá trị xác định để hiện đúng option đang chọn - mặc định option ĐẦU TIÊN khi tạo mới
// HOẶC khi sửa 1 biến cũ chưa cấu hình (aggregateFunction đang null từ BE).
if (props.formModel.aggregateFunction == null) props.formModel.aggregateFunction = Number(aggregateFunctionOptions[0]?.value ?? 1)

const statusOptions = computed(() => [
  { label: t('formula.active'), value: 1 },
  { label: t('formula.inactive'), value: 0 },
])

const isAutoVariable = computed(() => Number(props.formModel.aggregateFunction) !== NONE_AGGREGATE_FUNCTION)
const isCurrentAggregate = computed(() => Number(props.formModel.aggregateFunction) === CURRENT_AGGREGATE_FUNCTION)
const needsScopeN = computed(() => SCOPE_TYPES_NEEDING_N.includes(Number(props.formModel.scopeType)))
const scopeNLabel = computed(() => SCOPE_N_LABELS[Number(props.formModel.scopeType)] ?? nLabelFallback())

const needsScopeEndN = computed(() => SCOPE_END_TYPES_NEEDING_N.includes(Number(props.formModel.scopeEndType)))
const scopeEndNLabel = computed(() => SCOPE_END_N_LABELS[Number(props.formModel.scopeEndType)] ?? nLabelFallback())

// "Không áp dụng" (sentinel FE) -> null hết 4 field còn lại (biến "cứng"). Chọn hàm thật -> luôn gán
// Cột nguồn = Cường độ dB + dọn N/ngày cố định không liên quan tới ScopeType đang chọn - khớp validate
// "AggregateFunction/ScopeType phải đi cùng nhau" bên BE (FormulaController.ValidateVariableRequest).
function transformFormData(data: Record<string, any>) {
  if (Number(data.aggregateFunction) === NONE_AGGREGATE_FUNCTION) {
    data.aggregateFunction = null
    data.sourceColumn = null
    data.scopeType = null
    data.scopeN = null
    data.scopeFixedDate = null
    data.scopeEndType = null
    data.scopeEndN = null
    data.scopeEndFixedDate = null
    return data
  }
  data.sourceColumn = LEVEL_DB_SOURCE_COLUMN

  if (Number(data.aggregateFunction) === CURRENT_AGGREGATE_FUNCTION) {
    data.scopeType = null
    data.scopeN = null
    data.scopeFixedDate = null
    data.scopeEndType = null
    data.scopeEndN = null
    data.scopeEndFixedDate = null
    return data
  }

  if (!needsScopeN.value) data.scopeN = null
  if (data.scopeType !== SCOPE_FIXED_DATE) data.scopeFixedDate = null

  if (data.scopeType === SCOPE_LAST_N_READINGS) {
    data.scopeEndType = null
    data.scopeEndN = null
    data.scopeEndFixedDate = null
  } else {
    if (!needsScopeEndN.value) data.scopeEndN = null
    if (data.scopeEndType !== SCOPE_END_FIXED_DATE) data.scopeEndFixedDate = null
  }
  return data
}

function handleSuccess(data: any) {
  emit('success', data)
}

// --- Nút "Xem giá trị thật" - tính thử giá trị của cấu hình hiện tại trên dữ liệu thật của 1 bộ phận
// (chưa cần lưu). Danh sách thiết bị/bộ phận chỉ dùng để chọn - không liên quan tới formModel.
const machineOptions = ref<{ label: string; value: number }[]>([])
const machineComponentOptions = ref<{ label: string; value: number }[]>([])
const previewMachineId = ref<number>()
const previewMachineComponentId = ref<number>()
const previewLoading = ref(false)
const previewResult = ref<{ hasData: boolean; value?: number; message?: string } | null>(null)

async function loadMachines() {
  const res = await getAllMachineApi({})
  machineOptions.value = ((res.data as any[]) ?? []).map((m) => ({ label: m.name, value: m.id }))
}
loadMachines()

async function onMachineChange() {
  previewMachineComponentId.value = undefined
  machineComponentOptions.value = []
  previewResult.value = null
  if (!previewMachineId.value) return
  // hasMonitorPoints: false - bộ phận PD khớp qua vùng vẽ trên camera, không có dòng ở bảng
  // MachineMonitorPoints (khái niệm riêng của nhiệt độ), xem pd-history.vue.
  const res = await getComponentMachineApi({ machineId: previewMachineId.value, hasMonitorPoints: false })
  machineComponentOptions.value = ((res.data as any[]) ?? []).map((c) => ({ label: c.name, value: c.id }))
}

watch(previewMachineComponentId, () => (previewResult.value = null))

async function onPreview() {
  if (!previewMachineComponentId.value) return
  previewLoading.value = true
  previewResult.value = null
  try {
    const res = await previewFormulaVariableApi({
      machineComponentId: previewMachineComponentId.value,
      sourceColumn: LEVEL_DB_SOURCE_COLUMN,
      aggregateFunction: props.formModel.aggregateFunction,
      scopeType: props.formModel.scopeType,
      scopeN: props.formModel.scopeN,
      scopeFixedDate: props.formModel.scopeFixedDate,
      scopeEndType: props.formModel.scopeEndType,
      scopeEndN: props.formModel.scopeEndN,
      scopeEndFixedDate: props.formModel.scopeEndFixedDate,
    })
    previewResult.value = res.data ?? { hasData: false }
  } finally {
    previewLoading.value = false
  }
}
</script>

<style scoped>
.in-use-notice {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--warning) 12%, transparent);
  color: var(--warning);
  font-size: 12.5px;
  line-height: 1.5;
}

.field-hint {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 4px;
}

.preview-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px dashed var(--border);
  border-radius: 6px;
}

.preview-block__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-block__result {
  font-size: 13px;
  color: var(--text-main);
}
</style>
