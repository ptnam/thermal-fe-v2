// Khớp ĐÚNG giá trị enum bên BE (ThermalMonitoring.Common/Commons/Enums.cs:
// FormulaVariableSourceColumn/FormulaVariableAggregateFunction/FormulaVariableScopeType) - đổi số ở
// đây phải đổi cả bên BE, không tự suy ra được. Dùng chung cho FormulaVariableForm.vue (dropdown) và
// formula-settings.vue (hiển thị tóm tắt nguồn dữ liệu ở bảng "Biến số").

import { i18n } from '@/plugins/vueI18n'

interface OptionItem {
  key: string
  label: string
  value: number
}

const V = 'formula.variable.'
const tr = (key: string, n: string | number = 'N') => i18n.global.t(V + key, { n })

// label là getter để nhãn đổi theo ngôn ngữ mỗi lần render; {n} mặc định hiển thị "N"
const opt = (key: string, value: number): OptionItem => ({
  key,
  value,
  get label() {
    return tr(key)
  },
})

// Cột nguồn không còn chọn được ở form (mọi biến tự tính mới đều mặc định dB) - giữ lại danh sách này
// chỉ để hiển thị đúng nhãn cho dữ liệu cũ/chỉnh tay trong DB có thể khác mặc định.
export const LEVEL_DB_SOURCE_COLUMN = 1
export const SOURCE_COLUMN_OPTIONS: OptionItem[] = [
  opt('source.levelDb', LEVEL_DB_SOURCE_COLUMN),
  opt('source.growthRate', 2),
]

// 0 KHÔNG phải giá trị enum bên BE (AggregateFunction bên đó là smallint? - 0 không nằm trong dải
// 1-6) - sentinel CHỈ DÙNG NỘI BỘ để nhận diện dữ liệu cũ chưa cấu hình (aggregateFunction null).
export const NONE_AGGREGATE_FUNCTION = 0
// "Giá trị hiện tại" lấy thẳng giá trị lần đọc đang đánh giá - không tự tính trên lịch sử nên không
// có Khoảng thời gian (khác mọi hàm tổng hợp còn lại).
export const CURRENT_AGGREGATE_FUNCTION = 7
export const AGGREGATE_FUNCTION_OPTIONS: OptionItem[] = [
  opt('aggregate.first', 1),
  opt('aggregate.last', 2),
  opt('aggregate.min', 3),
  opt('aggregate.max', 4),
  opt('aggregate.avg', 5),
  opt('aggregate.count', 6),
  opt('aggregate.current', CURRENT_AGGREGATE_FUNCTION),
]

export const SCOPE_LAST_N_HOURS = 6
export const SCOPE_LAST_N_DAYS = 7
export const SCOPE_LAST_N_WEEKS = 8
export const SCOPE_LAST_N_MONTHS = 9
export const SCOPE_LAST_N_READINGS = 10
export const SCOPE_FIXED_DATE = 11

export const SCOPE_TYPE_OPTIONS: OptionItem[] = [
  opt('scope.sinceFirst', 1),
  opt('scope.today', 2),
  opt('scope.thisWeek', 3),
  opt('scope.thisMonth', 4),
  opt('scope.thisYear', 5),
  opt('scope.lastNHours', SCOPE_LAST_N_HOURS),
  opt('scope.lastNDays', SCOPE_LAST_N_DAYS),
  opt('scope.lastNWeeks', SCOPE_LAST_N_WEEKS),
  opt('scope.lastNMonths', SCOPE_LAST_N_MONTHS),
  opt('scope.lastNReadings', SCOPE_LAST_N_READINGS),
  opt('scope.fromDate', SCOPE_FIXED_DATE),
]

export const SCOPE_N_LABELS: Record<number, string> = {
  get [SCOPE_LAST_N_HOURS]() { return tr('nLabel.hours') },
  get [SCOPE_LAST_N_DAYS]() { return tr('nLabel.days') },
  get [SCOPE_LAST_N_WEEKS]() { return tr('nLabel.weeks') },
  get [SCOPE_LAST_N_MONTHS]() { return tr('nLabel.months') },
  get [SCOPE_LAST_N_READINGS]() { return tr('nLabel.readings') },
}
export const nLabelFallback = () => tr('nLabel.generic')

export const SCOPE_TYPES_NEEDING_N = [SCOPE_LAST_N_HOURS, SCOPE_LAST_N_DAYS, SCOPE_LAST_N_WEEKS, SCOPE_LAST_N_MONTHS, SCOPE_LAST_N_READINGS]

// Điểm KẾT THÚC khoảng thời gian (FormulaVariableScopeEndType, Enums.cs BE) - độc lập với điểm đầu ở
// trên, mặc định (null/Now) = thời điểm đang đánh giá. Không áp dụng khi ScopeType = "N lần đọc gần
// nhất" (đếm theo số dòng, không phải theo thời gian).
export const SCOPE_END_NOW = 1
export const SCOPE_END_FIXED_DATE = 2
export const SCOPE_END_LAST_N_HOURS = 3
export const SCOPE_END_LAST_N_DAYS = 4
export const SCOPE_END_LAST_N_WEEKS = 5
export const SCOPE_END_LAST_N_MONTHS = 6

export const SCOPE_END_TYPE_OPTIONS: OptionItem[] = [
  opt('scopeEnd.now', SCOPE_END_NOW),
  opt('scopeEnd.hoursAgo', SCOPE_END_LAST_N_HOURS),
  opt('scopeEnd.daysAgo', SCOPE_END_LAST_N_DAYS),
  opt('scopeEnd.weeksAgo', SCOPE_END_LAST_N_WEEKS),
  opt('scopeEnd.monthsAgo', SCOPE_END_LAST_N_MONTHS),
  opt('scopeEnd.toDate', SCOPE_END_FIXED_DATE),
]

export const SCOPE_END_N_LABELS: Record<number, string> = {
  get [SCOPE_END_LAST_N_HOURS]() { return tr('nLabel.hours') },
  get [SCOPE_END_LAST_N_DAYS]() { return tr('nLabel.days') },
  get [SCOPE_END_LAST_N_WEEKS]() { return tr('nLabel.weeks') },
  get [SCOPE_END_LAST_N_MONTHS]() { return tr('nLabel.months') },
}

export const SCOPE_END_TYPES_NEEDING_N = [SCOPE_END_LAST_N_HOURS, SCOPE_END_LAST_N_DAYS, SCOPE_END_LAST_N_WEEKS, SCOPE_END_LAST_N_MONTHS]

function findLabel(options: OptionItem[], value: number | null | undefined, n?: number | null): string | undefined {
  const option = options.find((o) => o.value === value)
  return option && tr(option.key, n ?? 'N')
}

export function aggregateFunctionLabel(row: { aggregateFunction?: number | null }): string {
  if (row.aggregateFunction == null) return tr('aggregate.hardcoded')
  return findLabel(AGGREGATE_FUNCTION_OPTIONS, row.aggregateFunction) ?? '?'
}

/// Nhãn khoảng thời gian riêng (không kèm hàm tổng hợp) - dùng cho cột "Khoảng thời gian" ở bảng.
export function scopeRangeLabel(row: {
  aggregateFunction?: number | null
  scopeType?: number | null
  scopeN?: number | null
  scopeFixedDate?: string | null
  scopeEndType?: number | null
  scopeEndN?: number | null
  scopeEndFixedDate?: string | null
}): string {
  if (row.aggregateFunction == null || row.aggregateFunction === CURRENT_AGGREGATE_FUNCTION) return '—'

  let scopeLabel = findLabel(SCOPE_TYPE_OPTIONS, row.scopeType, row.scopeN) ?? '?'
  if (row.scopeType === SCOPE_FIXED_DATE && row.scopeFixedDate) {
    scopeLabel = i18n.global.t(V + 'scope.fromDateValue', { date: row.scopeFixedDate })
  }

  if (row.scopeEndType != null && row.scopeEndType !== SCOPE_END_NOW) {
    let endLabel = findLabel(SCOPE_END_TYPE_OPTIONS, row.scopeEndType, row.scopeEndN) ?? '?'
    if (row.scopeEndType === SCOPE_END_FIXED_DATE && row.scopeEndFixedDate) {
      endLabel = i18n.global.t(V + 'scopeEnd.toDateValue', { date: row.scopeEndFixedDate })
    }
    scopeLabel = `${scopeLabel} → ${endLabel}`
  }
  return scopeLabel
}

/// Tóm tắt "nguồn dữ liệu" 1 dòng FormulaVariable thành 1 câu ngắn để hiển thị ở bảng danh sách, VD
/// "Giá trị đầu tiên · Cường độ PD (dB) · Tháng này". null nếu biến "cứng" (không tự tính).
export function summarizeVariableSource(row: {
  aggregateFunction?: number | null
  sourceColumn?: number | null
  scopeType?: number | null
  scopeN?: number | null
  scopeFixedDate?: string | null
  scopeEndType?: number | null
  scopeEndN?: number | null
  scopeEndFixedDate?: string | null
}): string | null {
  if (row.aggregateFunction == null) return null

  const parts = [findLabel(AGGREGATE_FUNCTION_OPTIONS, row.aggregateFunction) ?? '?']
  if (row.aggregateFunction !== 6 && row.sourceColumn != null && row.sourceColumn !== LEVEL_DB_SOURCE_COLUMN) {
    parts.push(findLabel(SOURCE_COLUMN_OPTIONS, row.sourceColumn) ?? '?')
  }

  if (row.aggregateFunction === CURRENT_AGGREGATE_FUNCTION) {
    return parts.join(' · ')
  }

  let scopeLabel = findLabel(SCOPE_TYPE_OPTIONS, row.scopeType, row.scopeN) ?? '?'
  if (row.scopeType === SCOPE_FIXED_DATE && row.scopeFixedDate) {
    scopeLabel = i18n.global.t(V + 'scope.fromDateValue', { date: row.scopeFixedDate })
  }

  if (row.scopeEndType != null && row.scopeEndType !== SCOPE_END_NOW) {
    let endLabel = findLabel(SCOPE_END_TYPE_OPTIONS, row.scopeEndType, row.scopeEndN) ?? '?'
    if (row.scopeEndType === SCOPE_END_FIXED_DATE && row.scopeEndFixedDate) {
      endLabel = i18n.global.t(V + 'scopeEnd.toDateValue', { date: row.scopeEndFixedDate })
    }
    scopeLabel = `${scopeLabel} → ${endLabel}`
  }
  parts.push(scopeLabel)

  return parts.join(' · ')
}
