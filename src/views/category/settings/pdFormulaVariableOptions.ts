// Khớp ĐÚNG giá trị enum bên BE (ThermalMonitoring.Common/Commons/Enums.cs:
// FormulaVariableSourceColumn/FormulaVariableAggregateFunction/FormulaVariableScopeType) - đổi số ở
// đây phải đổi cả bên BE, không tự suy ra được. Dùng chung cho FormulaVariableForm.vue (dropdown) và
// formula-settings.vue (hiển thị tóm tắt nguồn dữ liệu ở bảng "Biến số").

interface OptionItem {
  label: string
  value: number
}

// Cột nguồn không còn chọn được ở form (mọi biến tự tính mới đều mặc định dB) - giữ lại danh sách này
// chỉ để hiển thị đúng nhãn cho dữ liệu cũ/chỉnh tay trong DB có thể khác mặc định.
export const LEVEL_DB_SOURCE_COLUMN = 1
export const SOURCE_COLUMN_OPTIONS: OptionItem[] = [
  { label: 'Cường độ PD (dB)', value: LEVEL_DB_SOURCE_COLUMN },
  { label: 'Tốc độ tăng ΔPD% theo kỳ', value: 2 },
]

// 0 KHÔNG phải giá trị enum bên BE (AggregateFunction bên đó là smallint? - 0 không nằm trong dải
// 1-6) - sentinel CHỈ DÙNG NỘI BỘ để nhận diện dữ liệu cũ chưa cấu hình (aggregateFunction null).
export const NONE_AGGREGATE_FUNCTION = 0
// "Giá trị hiện tại" lấy thẳng giá trị lần đọc đang đánh giá - không tự tính trên lịch sử nên không
// có Khoảng thời gian (khác mọi hàm tổng hợp còn lại).
export const CURRENT_AGGREGATE_FUNCTION = 7
export const AGGREGATE_FUNCTION_OPTIONS: OptionItem[] = [
  { label: 'Giá trị đầu tiên', value: 1 },
  { label: 'Giá trị cuối cùng', value: 2 },
  { label: 'Giá trị nhỏ nhất', value: 3 },
  { label: 'Giá trị lớn nhất', value: 4 },
  { label: 'Trung bình', value: 5 },
  { label: 'Số lần đọc', value: 6 },
  { label: 'Giá trị hiện tại', value: CURRENT_AGGREGATE_FUNCTION },
]

export const SCOPE_LAST_N_HOURS = 6
export const SCOPE_LAST_N_DAYS = 7
export const SCOPE_LAST_N_WEEKS = 8
export const SCOPE_LAST_N_MONTHS = 9
export const SCOPE_LAST_N_READINGS = 10
export const SCOPE_FIXED_DATE = 11

export const SCOPE_TYPE_OPTIONS: OptionItem[] = [
  { label: 'Từ lúc phát hiện đầu tiên', value: 1 },
  { label: 'Hôm nay', value: 2 },
  { label: 'Tuần này', value: 3 },
  { label: 'Tháng này', value: 4 },
  { label: 'Năm này', value: 5 },
  { label: 'N giờ gần nhất', value: SCOPE_LAST_N_HOURS },
  { label: 'N ngày gần nhất', value: SCOPE_LAST_N_DAYS },
  { label: 'N tuần gần nhất', value: SCOPE_LAST_N_WEEKS },
  { label: 'N tháng gần nhất', value: SCOPE_LAST_N_MONTHS },
  { label: 'N lần đọc gần nhất', value: SCOPE_LAST_N_READINGS },
  { label: 'Từ 1 ngày cụ thể', value: SCOPE_FIXED_DATE },
]

export const SCOPE_N_LABELS: Record<number, string> = {
  [SCOPE_LAST_N_HOURS]: 'Số giờ (N)',
  [SCOPE_LAST_N_DAYS]: 'Số ngày (N)',
  [SCOPE_LAST_N_WEEKS]: 'Số tuần (N)',
  [SCOPE_LAST_N_MONTHS]: 'Số tháng (N)',
  [SCOPE_LAST_N_READINGS]: 'Số lần đọc (N)',
}

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
  { label: 'Hiện tại', value: SCOPE_END_NOW },
  { label: 'N giờ gần nhất', value: SCOPE_END_LAST_N_HOURS },
  { label: 'N ngày gần nhất', value: SCOPE_END_LAST_N_DAYS },
  { label: 'N tuần gần nhất', value: SCOPE_END_LAST_N_WEEKS },
  { label: 'N tháng gần nhất', value: SCOPE_END_LAST_N_MONTHS },
  { label: 'Đến 1 ngày cụ thể', value: SCOPE_END_FIXED_DATE },
]

export const SCOPE_END_N_LABELS: Record<number, string> = {
  [SCOPE_END_LAST_N_HOURS]: 'Số giờ (N)',
  [SCOPE_END_LAST_N_DAYS]: 'Số ngày (N)',
  [SCOPE_END_LAST_N_WEEKS]: 'Số tuần (N)',
  [SCOPE_END_LAST_N_MONTHS]: 'Số tháng (N)',
}

export const SCOPE_END_TYPES_NEEDING_N = [SCOPE_END_LAST_N_HOURS, SCOPE_END_LAST_N_DAYS, SCOPE_END_LAST_N_WEEKS, SCOPE_END_LAST_N_MONTHS]

function findLabel(options: OptionItem[], value: number | null | undefined): string | undefined {
  return options.find((o) => o.value === value)?.label
}

export function aggregateFunctionLabel(row: { aggregateFunction?: number | null }): string {
  if (row.aggregateFunction == null) return 'Biến cứng (code)'
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

  let scopeLabel = findLabel(SCOPE_TYPE_OPTIONS, row.scopeType) ?? '?'
  if (row.scopeType != null && SCOPE_TYPES_NEEDING_N.includes(row.scopeType) && row.scopeN) {
    scopeLabel = scopeLabel.replace('N', String(row.scopeN))
  } else if (row.scopeType === SCOPE_FIXED_DATE && row.scopeFixedDate) {
    scopeLabel = `Từ ${row.scopeFixedDate}`
  }

  if (row.scopeEndType != null && row.scopeEndType !== SCOPE_END_NOW) {
    let endLabel = findLabel(SCOPE_END_TYPE_OPTIONS, row.scopeEndType) ?? '?'
    if (SCOPE_END_TYPES_NEEDING_N.includes(row.scopeEndType) && row.scopeEndN) {
      endLabel = endLabel.replace('N', String(row.scopeEndN))
    } else if (row.scopeEndType === SCOPE_END_FIXED_DATE && row.scopeEndFixedDate) {
      endLabel = `Đến ${row.scopeEndFixedDate}`
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

  let scopeLabel = findLabel(SCOPE_TYPE_OPTIONS, row.scopeType) ?? '?'
  if (row.scopeType != null && SCOPE_TYPES_NEEDING_N.includes(row.scopeType) && row.scopeN) {
    scopeLabel = scopeLabel.replace('N', String(row.scopeN))
  } else if (row.scopeType === SCOPE_FIXED_DATE && row.scopeFixedDate) {
    scopeLabel = `Từ ${row.scopeFixedDate}`
  }

  if (row.scopeEndType != null && row.scopeEndType !== SCOPE_END_NOW) {
    let endLabel = findLabel(SCOPE_END_TYPE_OPTIONS, row.scopeEndType) ?? '?'
    if (SCOPE_END_TYPES_NEEDING_N.includes(row.scopeEndType) && row.scopeEndN) {
      endLabel = endLabel.replace('N', String(row.scopeEndN))
    } else if (row.scopeEndType === SCOPE_END_FIXED_DATE && row.scopeEndFixedDate) {
      endLabel = `Đến ${row.scopeEndFixedDate}`
    }
    scopeLabel = `${scopeLabel} → ${endLabel}`
  }
  parts.push(scopeLabel)

  return parts.join(' · ')
}
