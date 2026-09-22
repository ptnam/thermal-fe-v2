<template>
  <FormWrapper
      ref="formRef"
      :form-model="formModel"
      :form-props="{ labelWidth: '140px', labelPosition: 'top' }"
      :request-fn="isEditing ? editFormulaApi : addFormulaApi"
      :isEditing="isEditing"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <div v-if="isEditing && formModel.isLocked" class="in-use-notice">
        Công thức này đã dùng để tính ra kết quả thật - không thể sửa Tên/Biểu thức/Mô tả. Đổi Trạng thái ở nút bật/tắt tại danh sách.
      </div>
      <el-form-item label="Tên công thức" prop="name" :error="formErrors.Name">
        <el-input v-model="formModel.name" :disabled="isLocked"/>
      </el-form-item>
      <el-form-item label="Mã công thức" prop="code" :error="formErrors.Code">
        <el-input v-model="formModel.code" :disabled="isEditing"/>
        <div class="field-hint">Không đổi được sau khi tạo</div>
      </el-form-item>

      <div class="formula-form__expression">
        <div class="formula-form__expression-head">
          <label class="formula-form__label">Biểu thức <span class="required">*</span></label>
          <a class="formula-form__validate-link" @mousedown.prevent="onValidate">Kiểm tra công thức</a>
        </div>

        <!-- contenteditable - tô màu @biến ngay trong câu, gõ @ để gợi ý chèn biến (danh sách biến động,
             load từ listFormulaVariablesApi). -->
        <div class="formula-form__input-wrap">
          <div
              ref="editorRef"
              class="formula-form__input"
              :class="{ 'is-error': !!formErrors.Expression }"
              :contenteditable="!isLocked"
              data-placeholder="VD: (current - first) / (first * months) * 100. Gõ @ để chèn biến"
              @input="onInput"
              @keydown="onKeydown"
              @blur="popupOpen = false"
          ></div>
        </div>
        <p v-if="formErrors.Expression" class="formula-form__validate-msg is-error">{{ formErrors.Expression }}</p>
        <p v-if="validateMessage" class="formula-form__validate-msg" :class="{ 'is-error': !validateOk }">
          {{ validateMessage }}
        </p>
        <ul v-if="variables.length" class="formula-form__legend">
          <li v-for="v in variables" :key="v.name"><b>{{ v.name }}</b>: {{ v.label }}</li>
        </ul>
      </div>

      <teleport to="body">
        <div v-if="popupOpen" class="formula-form__popup" :style="popupStyle">
          <div
              v-for="v in filteredVariables"
              :key="v.name"
              class="formula-form__popup-row"
              @mousedown.prevent="insertVariable(v)"
          >
            <b>@{{ v.name }}</b>
            <span class="formula-form__popup-label">{{ v.label }}</span>
          </div>
        </div>
      </teleport>

      <el-form-item label="Mô tả" prop="description" :error="formErrors.Description">
        <el-input v-model="formModel.description" type="textarea" :rows="2" :disabled="isLocked"/>
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status" :error="formErrors.Status">
        <el-select v-model="formModel.status">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value"/>
        </el-select>
      </el-form-item>
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
import FormWrapper from '@/components/Form/FormWrapper.vue'
import SaveButton from '@/components/Button/SaveButton.vue'
import CancelButton from '@/components/Button/CancelButton.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { isFormEditing } from '@/utils/is'
import { addFormulaApi, editFormulaApi, listFormulaVariablesApi, validateFormulaApi } from '@/api/formula'

// Hiện chỉ có Domain=1 (Pd) - xem FormulaDomain (BE, Enums.cs).
const PD_DOMAIN = 1

const props = defineProps({
  formModel: {
    type: Object as () => { id?: number; domain?: number; code?: string; name?: string; expression?: string; description?: string; status?: number; isLocked?: boolean },
    required: true,
  },
})
const emit = defineEmits<(e: 'success', data: any) => void>()

const formRef = ref<InstanceType<typeof FormWrapper>>()
const isEditing = computed(() => isFormEditing(props.formModel))
const isLocked = computed(() => !!(isEditing.value && props.formModel.isLocked))
if (!props.formModel.domain) props.formModel.domain = PD_DOMAIN
if (props.formModel.status == null) props.formModel.status = 1

const statusOptions = [
  { label: 'Hoạt động', value: 1 },
  { label: 'Không hoạt động', value: 0 },
]

const variables = ref<{ name: string; label: string }[]>([])
onMounted(async () => {
  const res = await listFormulaVariablesApi({ domain: PD_DOMAIN })
  variables.value = ((res.data as any[]) ?? []).filter((v) => v.status === 1)
  renderContent(props.formModel.expression ?? '')
})

const validateOk = ref(true)
const validateMessage = ref('')
async function onValidate() {
  validateMessage.value = ''
  if (!props.formModel.expression) return
  const res = await validateFormulaApi({ domain: PD_DOMAIN, expression: props.formModel.expression })
  const result = res.data as any
  validateOk.value = !!result?.isValid
  validateMessage.value = result?.isValid ? 'Hợp lệ' : 'Không hợp lệ'
}
watch(() => props.formModel.expression, () => {
  validateMessage.value = ''
})

const editorRef = ref<HTMLDivElement>()
const popupOpen = ref(false)
const popupStyle = ref<Record<string, string>>({})
const filteredVariables = ref<{ name: string; label: string }[]>([])
const triggerStart = ref(-1)
const caretOffset = ref(0)
let selfUpdating = false

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const renderContent = (text: string) => {
  const el = editorRef.value
  if (!el) return
  const names = variables.value.map((v) => v.name)
  const html = names.length
    ? escapeHtml(text).replace(new RegExp(`\\b(${names.join('|')})\\b`, 'g'), '<b style="color:var(--primary)">$1</b>')
    : escapeHtml(text)
  el.innerHTML = html
}

const getPlainText = (el: HTMLElement) => (el.innerText || '').replace(/\n+$/, '')

const getCaretOffset = (el: HTMLElement): number => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  const range = sel.getRangeAt(0)
  if (!el.contains(range.startContainer)) return 0
  const preRange = range.cloneRange()
  preRange.selectNodeContents(el)
  preRange.setEnd(range.startContainer, range.startOffset)
  return preRange.toString().length
}

const setCaretOffset = (el: HTMLElement, offset: number) => {
  const sel = window.getSelection()
  if (!sel) return

  let remaining = offset
  let targetNode: Node = el
  let targetOffset = 0

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const len = node.textContent?.length ?? 0
    if (remaining <= len) {
      targetNode = node
      targetOffset = remaining
      break
    }
    remaining -= len
    targetNode = node
    targetOffset = len
    node = walker.nextNode()
  }

  const range = document.createRange()
  range.setStart(targetNode, targetOffset)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

// NCalc chỉ hiểu toán tử ASCII (*, /, -) - tự quy đổi ký hiệu Unicode "đẹp" (×, ÷, −) về ASCII.
const normalizeOperators = (text: string) => text.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')

const updatePopupPosition = () => {
  const el = editorRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  popupStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 280)}px`,
  }
}

const onViewportChange = () => {
  if (!popupOpen.value) return
  updatePopupPosition()
}

const findTrigger = (text: string, caret: number): { start: number; query: string } | null => {
  let i = caret - 1
  while (i >= 0 && /[A-Za-z0-9_]/.test(text[i])) i--
  if (i >= 0 && text[i] === '@') return { start: i, query: text.slice(i + 1, caret) }
  return null
}

function onInput() {
  const el = editorRef.value
  if (!el) return

  const offset = getCaretOffset(el)
  const text = normalizeOperators(getPlainText(el))

  selfUpdating = true
  props.formModel.expression = text
  renderContent(text)
  setCaretOffset(el, offset)

  const trigger = findTrigger(text, offset)
  const matches = trigger
    ? variables.value.filter((v) => v.name.toLowerCase().startsWith(trigger.query.toLowerCase()))
    : []

  if (trigger && matches.length) {
    triggerStart.value = trigger.start
    caretOffset.value = offset
    filteredVariables.value = matches
    updatePopupPosition()
    popupOpen.value = true
  } else {
    popupOpen.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') e.preventDefault()
  if (e.key === 'Escape') popupOpen.value = false
}

function insertVariable(v: { name: string }) {
  const el = editorRef.value
  if (!el || triggerStart.value < 0) return

  const text = props.formModel.expression ?? ''
  const before = text.slice(0, triggerStart.value)
  const after = text.slice(caretOffset.value)
  const newBefore = before + v.name
  const newText = newBefore + after

  selfUpdating = true
  props.formModel.expression = newText
  renderContent(newText)
  setCaretOffset(el, newBefore.length)
  popupOpen.value = false
}

watch(() => props.formModel.expression, (val) => {
  if (selfUpdating) {
    selfUpdating = false
    return
  }
  renderContent(val ?? '')
})

onUnmounted(() => {
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
})
onMounted(() => {
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
})

function handleSuccess(data: any) {
  emit('success', data)
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

.formula-form__label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}
.formula-form__label .required {
  color: var(--danger);
  margin-left: 3px;
}

.formula-form__expression {
  margin-bottom: 18px;
}

.formula-form__expression-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.formula-form__validate-link {
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
}

.formula-form__input-wrap {
  position: relative;
}

.formula-form__input {
  width: 100%;
  min-height: 32px;
  padding: 5px 11px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-body);
  font-size: 14px;
  color: var(--text-main);
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.formula-form__input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent);
}

.formula-form__input.is-error {
  border-color: var(--danger);
}

.formula-form__input:empty::before {
  content: attr(data-placeholder);
  color: var(--text-sub);
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.formula-form__popup {
  position: fixed;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  max-height: 220px;
  z-index: 3000;
}

.formula-form__popup-row {
  padding: 8px 14px;
  cursor: pointer;
  border-top: 1px solid var(--border);
}

.formula-form__popup-row:first-child {
  border-top: none;
}

.formula-form__popup-row:hover {
  background: var(--bg-body);
}

.formula-form__popup-row b {
  color: var(--primary);
  font-size: 13px;
}

.formula-form__popup-label {
  margin-left: 6px;
  font-size: 12px;
  color: var(--text-sub);
}

.formula-form__validate-msg {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--success);
}

.formula-form__validate-msg.is-error {
  color: var(--danger);
}

.formula-form__legend {
  margin: 8px 0 0;
  padding: 0 4px 0 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px 16px;
  max-height: 52px;
  overflow-y: auto;
}

.formula-form__legend li {
  font-size: 10px;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.formula-form__legend b {
  color: var(--primary);
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
}
</style>
