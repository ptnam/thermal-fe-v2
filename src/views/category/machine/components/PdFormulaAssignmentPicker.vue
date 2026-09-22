<template>
  <div class="pd-assignment">
    <div class="pd-assignment__label-row">
      <span class="pd-assignment__label">Công thức tốc độ tăng ΔPD% theo kỳ</span>
      <span class="pd-assignment-card__hint">Soạn/sửa công thức ở màn Cài đặt (Quản trị hệ thống)</span>
    </div>

    <p v-if="!targetId" class="pd-assignment-card__empty">
      Lưu {{ targetLabel }} trước khi gán công thức riêng.
    </p>

    <template v-else>
      <p class="pd-assignment-card__label">Gán công thức mới</p>
      <div class="pd-assignment-new">
        <el-select v-model="newFormulaId" placeholder="Chọn công thức" filterable class="pd-assignment-new__select">
          <el-option v-for="f in activeFormulas" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-date-picker
          v-model="newEffectiveFrom"
          type="datetime"
          placeholder="Thời gian bắt đầu áp dụng"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          :disabled-date="disabledDate"
          class="pd-assignment-new__date"
        />
        <el-button :loading="saving" :disabled="!newFormulaId || !newEffectiveFrom" @click="onAssign">Gán</el-button>
      </div>
      <p v-if="showPastSelectionError" class="pd-assignment-card__hint pd-assignment-card__hint--error">Thời gian bắt đầu áp dụng không được ở quá khứ.</p>
      <p class="pd-assignment-card__hint pd-assignment-card__hint--gap">Thời gian bắt đầu áp dụng có thể ở tương lai - công thức chỉ có hiệu lực từ đúng thời điểm đó, không ảnh hưởng dữ liệu đã ghi nhận trước đó.</p>

      <p v-if="!appliedRows.length && !historyLoading" class="pd-assignment-card__hint pd-assignment-card__hint--gap">
        Hiện chưa có công thức riêng nào có hiệu lực - đang dùng công thức theo loại bộ phận/mặc định.
      </p>

      <div class="pd-assignment-columns">
          <div class="pd-assignment-panel">
            <div class="pd-assignment-panel__header">
              <span class="pd-assignment-panel__icon pd-assignment-panel__icon--history">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
              </span>
              <div>
                <div class="pd-assignment-panel__title">Lịch sử áp dụng <span class="pd-assignment-panel__count">({{ appliedRows.length }})</span></div>
                <div class="pd-assignment-panel__subtitle">Các lần công thức đã được áp dụng trong hệ thống.</div>
              </div>
            </div>
            <div v-loading="historyLoading" class="pd-assignment-table-wrap">
              <p v-if="!appliedRows.length && !historyLoading" class="pd-assignment-card__empty">Chưa có công thức nào được áp dụng.</p>
              <table v-else class="pd-assignment-table">
                <thead>
                  <tr>
                    <th>Thời gian áp dụng</th>
                    <th>Công thức</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="row in appliedRows" :key="row.id">
                    <tr class="pd-assignment-table__row" :class="{ 'is-clickable': row.formulaExpression }" @click="row.formulaExpression && toggleExpression(row.id)">
                      <td class="pd-assignment-table__date">
                        {{ formatDateTime(row.effectiveFrom) }}
                        <svg v-if="row.formulaExpression" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="pd-assignment-table__expand" :class="{ 'is-open': expandedRowId === row.id }"><path d="M6 9l6 6 6-6" /></svg>
                      </td>
                      <td class="pd-assignment-table__name">{{ row.formulaName }}</td>
                      <td>
                        <span v-if="row.isCurrentlyActive" class="pd-assignment-status pd-assignment-status--active">Đang áp dụng</span>
                        <span v-else class="pd-assignment-status pd-assignment-status--stopped">Đã dừng</span>
                      </td>
                    </tr>
                    <tr v-if="expandedRowId === row.id && row.formulaExpression" class="pd-assignment-table__detail-row">
                      <td colspan="3">
                        <code class="pd-assignment-table__expression">{{ row.formulaExpression }}</code>
                        <ul v-if="matchedVariables(row.formulaExpression).length" class="pd-assignment-table__var-list">
                          <li v-for="v in matchedVariables(row.formulaExpression)" :key="v.name"><code>{{ v.name }}</code>: {{ v.label }}<template v-if="v.description"> - {{ v.description }}</template></li>
                        </ul>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <div class="pd-assignment-panel__footer">Tổng cộng: {{ appliedRows.length }} bản ghi</div>
          </div>

          <div class="pd-assignment-panel">
            <div class="pd-assignment-panel__header">
              <span class="pd-assignment-panel__icon pd-assignment-panel__icon--upcoming">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </span>
              <div>
                <div class="pd-assignment-panel__title">Dự kiến sẽ áp dụng <span class="pd-assignment-panel__count">({{ upcomingRows.length }})</span></div>
                <div class="pd-assignment-panel__subtitle">Các lần áp dụng theo lịch trong tương lai.</div>
              </div>
            </div>
            <div v-loading="historyLoading" class="pd-assignment-table-wrap">
              <p v-if="!upcomingRows.length && !historyLoading" class="pd-assignment-card__empty">Không có công thức nào đang chờ áp dụng.</p>
              <table v-else class="pd-assignment-table">
                <thead>
                  <tr>
                    <th>Thời gian áp dụng</th>
                    <th>Công thức</th>
                    <th>Trạng thái</th>
                    <th class="pd-assignment-table__action-col"></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="row in upcomingRows" :key="row.id">
                    <tr class="pd-assignment-table__row" :class="{ 'is-clickable': row.formulaExpression }" @click="row.formulaExpression && toggleExpression(row.id)">
                      <td class="pd-assignment-table__date">
                        {{ formatDateTime(row.effectiveFrom) }}
                        <svg v-if="row.formulaExpression" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="pd-assignment-table__expand" :class="{ 'is-open': expandedRowId === row.id }"><path d="M6 9l6 6 6-6" /></svg>
                      </td>
                      <td class="pd-assignment-table__name">{{ row.formulaName }}</td>
                      <td>
                        <span v-if="row.isFutureWinner" class="pd-assignment-status pd-assignment-status--future">Sẽ áp dụng</span>
                        <span v-else class="pd-assignment-status pd-assignment-status--stopped">Đã bị ghi đè</span>
                      </td>
                      <td class="pd-assignment-table__action-col"><button type="button" class="pd-assignment-table__cancel" title="Hủy việc áp dụng công thức này" @click.stop="onCancel(row.id)">Hủy</button></td>
                    </tr>
                    <tr v-if="expandedRowId === row.id && row.formulaExpression" class="pd-assignment-table__detail-row">
                      <td colspan="4">
                        <code class="pd-assignment-table__expression">{{ row.formulaExpression }}</code>
                        <ul v-if="matchedVariables(row.formulaExpression).length" class="pd-assignment-table__var-list">
                          <li v-for="v in matchedVariables(row.formulaExpression)" :key="v.name"><code>{{ v.name }}</code>: {{ v.label }}<template v-if="v.description"> - {{ v.description }}</template></li>
                        </ul>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <div class="pd-assignment-panel__footer">Tổng cộng: {{ upcomingRows.length }} bản ghi</div>
          </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addFormulaAssignmentApi, deleteFormulaAssignmentApi, listFormulaAssignmentsApi, listFormulasApi, listFormulaVariablesApi } from '@/api/formula'

// ThresholdType.PdGrowthRate (7) - hiện picker này chỉ dùng cho công thức ΔPD%/tháng, xem Enums.cs (BE).
const PD_GROWTH_RATE_THRESHOLD_TYPE = 7
const PD_DOMAIN = 1

const props = defineProps<{
  /** FormulaAssignmentTargetType: 1 = MachineComponent, 2 = MachinePart (Enums.cs). */
  targetType: number
  /** Id của bộ phận/loại bộ phận - undefined khi đang thêm mới (chưa lưu, chưa có id). */
  targetId?: number
}>()

const targetLabel = computed(() => (props.targetType === 2 ? 'loại bộ phận' : 'bộ phận'))
function formatDateTime(v: string) {
  return dayjs(v).format('DD/MM/YYYY HH:mm')
}

interface AssignmentRow {
  id: number
  formulaName: string
  formulaExpression?: string
  effectiveFrom: string
  isCurrentlyActive: boolean
}
const history = ref<AssignmentRow[]>([])
const historyLoading = ref(false)
const expandedRowId = ref<number>()
function toggleExpression(id: number) {
  expandedRowId.value = expandedRowId.value === id ? undefined : id
}
async function loadHistory() {
  if (!props.targetId) {
    history.value = []
    return
  }
  historyLoading.value = true
  try {
    const res = await listFormulaAssignmentsApi({
      targetType: props.targetType,
      targetId: props.targetId,
      thresholdType: PD_GROWTH_RATE_THRESHOLD_TYPE,
    })
    history.value = (res.data as any[]) ?? []
  } finally {
    historyLoading.value = false
  }
}

// API trả sẵn theo EffectiveFrom desc, Id desc (khớp tie-break lúc đánh giá thật - PdDataRepository.
// ResolveFormulaAssignmentAsync) - nếu 2+ công thức CÙNG thời điểm áp dụng (chỉ xảy ra ở tương lai),
// dòng ĐẦU TIÊN gặp cho mỗi thời điểm (Id lớn nhất = gán SAU) mới là công thức thực sự sẽ dùng.
const historyRows = computed(() => {
  const now = dayjs()
  const seen = new Set<string>()
  return history.value.map((row) => {
    const isFuture = !row.isCurrentlyActive && dayjs(row.effectiveFrom).isAfter(now)
    let isFutureWinner = false
    let isFutureOverridden = false
    if (isFuture) {
      if (seen.has(row.effectiveFrom)) {
        isFutureOverridden = true
      } else {
        seen.add(row.effectiveFrom)
        isFutureWinner = true
      }
    }
    return { ...row, isFuture, isFutureWinner, isFutureOverridden }
  })
})
const appliedRows = computed(() => historyRows.value.filter((row) => !row.isFuture))
const upcomingRows = computed(() => historyRows.value.filter((row) => row.isFuture))

const activeFormulas = ref<{ id: number; name: string }[]>([])
async function loadFormulas() {
  const res = await listFormulasApi({ domain: PD_DOMAIN, status: 1 })
  activeFormulas.value = (res.data as any[]) ?? []
}

interface FormulaVariable {
  name: string
  label: string
  description?: string
}
const variables = ref<FormulaVariable[]>([])
async function loadVariables() {
  const res = await listFormulaVariablesApi({ domain: PD_DOMAIN })
  variables.value = (res.data as any[]) ?? []
}
function matchedVariables(expression?: string) {
  if (!expression) return []
  return variables.value.filter((v) => new RegExp(`\\b${v.name}\\b`, 'i').test(expression))
}

function defaultEffectiveFrom() {
  return dayjs().format('YYYY-MM-DD HH:mm:00')
}

const newFormulaId = ref<number>()
const newEffectiveFrom = ref<string>(defaultEffectiveFrom())
const saving = ref(false)

function disabledDate(date: Date) {
  return dayjs(date).isBefore(dayjs(), 'day')
}
const isPastSelection = computed(() => !!newEffectiveFrom.value && dayjs(newEffectiveFrom.value).isBefore(dayjs()))
const showPastSelectionError = ref(false)
watch(newEffectiveFrom, () => { showPastSelectionError.value = false })

async function onAssign() {
  if (!props.targetId || !newFormulaId.value || !newEffectiveFrom.value) return
  if (isPastSelection.value) {
    showPastSelectionError.value = true
    return
  }
  showPastSelectionError.value = false
  saving.value = true
  try {
    await addFormulaAssignmentApi({
      targetType: props.targetType,
      targetId: props.targetId,
      thresholdType: PD_GROWTH_RATE_THRESHOLD_TYPE,
      formulaId: newFormulaId.value,
      effectiveFrom: newEffectiveFrom.value,
    })
    ElMessage.success('Đã gán công thức')
    newFormulaId.value = undefined
    newEffectiveFrom.value = defaultEffectiveFrom()
    await loadHistory()
  } finally {
    saving.value = false
  }
}

async function onCancel(id: number) {
  try {
    await ElMessageBox.confirm('Hủy việc áp dụng công thức này? Chỉ áp dụng được cho công thức chưa tới thời điểm hiệu lực.', 'Xác nhận hủy', {
      type: 'warning',
      confirmButtonText: 'Hủy áp dụng',
      cancelButtonText: 'Đóng',
    })
  } catch {
    return
  }
  await deleteFormulaAssignmentApi(id)
  ElMessage.success('Đã hủy việc áp dụng')
  await loadHistory()
}

onMounted(() => {
  void loadFormulas()
  void loadVariables()
  void loadHistory()
})
watch(() => props.targetId, loadHistory)
</script>

<style scoped>
.pd-assignment {
  margin-bottom: 20px;
}

.pd-assignment__label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.pd-assignment__label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.pd-assignment-card__label {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--text-sub);
}

.pd-assignment-card__empty {
  margin: 0;
  font-size: 12px;
  color: var(--text-sub);
  font-style: italic;
}

.pd-assignment-card__hint {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-sub);
}

.pd-assignment-card__hint--error {
  color: var(--danger);
}

.pd-assignment-card__hint--gap {
  display: block;
  margin: 0 0 12px;
}

.pd-assignment-columns {
  display: flex;
  gap: 16px;
}

.pd-assignment-panel {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
}

.pd-assignment-panel__header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.pd-assignment-panel__icon {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pd-assignment-panel__icon--history {
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
}
.pd-assignment-panel__icon--upcoming {
  background: color-mix(in srgb, var(--purple) 12%, transparent);
  color: var(--purple);
}
.pd-assignment-panel__icon svg {
  width: 13px;
  height: 13px;
}

.pd-assignment-panel__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
}

.pd-assignment-panel__count {
  font-weight: 400;
  color: var(--text-sub);
}

.pd-assignment-panel__subtitle {
  margin-top: 2px;
  font-size: 10px;
  color: var(--text-sub);
}

.pd-assignment-panel__footer {
  padding-top: 6px;
  border-top: 1px solid var(--border);
  font-size: 10px;
  color: var(--text-sub);
}

.pd-assignment-table-wrap {
  flex: 1 1 auto;
  min-height: 20px;
  max-height: 190px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.pd-assignment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.pd-assignment-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: left;
  font-weight: 600;
  font-size: 10px;
  color: var(--text-sub);
  background: var(--bg-body);
  padding: 5px 8px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.pd-assignment-table th:first-child,
.pd-assignment-table td:first-child {
  padding-left: 10px;
}

.pd-assignment-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.pd-assignment-table tbody tr:last-child > td {
  border-bottom: none;
}

.pd-assignment-table__row.is-clickable {
  cursor: pointer;
}
.pd-assignment-table__row.is-clickable:hover td {
  background: var(--bg-body);
}

.pd-assignment-table__date {
  position: relative;
  padding-right: 22px !important;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  color: var(--text-sub);
  white-space: nowrap;
}

.pd-assignment-table__name {
  color: var(--text-main);
}

.pd-assignment-table__expand {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  color: var(--text-sub);
  transition: transform 0.15s;
}
.pd-assignment-table__expand.is-open { transform: translateY(-50%) rotate(180deg); }

.pd-assignment-table__action-col {
  width: 34px;
  padding-left: 2px !important;
  padding-right: 6px !important;
  text-align: center;
}

.pd-assignment-table__detail-row td {
  background: var(--bg-body);
}
.pd-assignment-table__expression {
  display: block;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 6px 8px;
  word-break: break-all;
}
.pd-assignment-table__var-list {
  margin: 6px 0 0;
  padding-left: 16px;
  font-size: 10px;
  color: var(--text-sub);
}
.pd-assignment-table__var-list li {
  margin-bottom: 2px;
}
.pd-assignment-table__var-list code {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  color: var(--primary);
  font-weight: 600;
}

.pd-assignment-status {
  font-size: 11px;
  white-space: nowrap;
}
.pd-assignment-status--active {
  color: var(--success);
}
.pd-assignment-status--stopped {
  color: var(--text-sub);
}
.pd-assignment-status--future {
  color: var(--primary);
}

.pd-assignment-table__cancel {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  padding: 1px 6px;
  margin: 0;
  font-family: inherit;
  font-size: 11px;
  color: var(--danger);
  cursor: pointer;
}
.pd-assignment-table__cancel:hover {
  text-decoration: underline;
}

.pd-assignment-new {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pd-assignment-new__select {
  flex: 1 1 220px;
  min-width: 0;
}

.pd-assignment-new__date {
  flex: 0 0 200px;
}

@media (max-width: 480px) {
  .pd-assignment-columns {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
