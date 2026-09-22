<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useConfirmModal } from '@/hooks/web/useModal'
import { notificationDetailApi, updateNotificationStatusApi } from '@/api/notification'
import { computed, onMounted, ref, watch } from 'vue'
import { PATH_URL } from '@/plugins/axios/service'
import router from '@/router'
import { listFormulaVariablesApi } from '@/api/formula'

// Dùng chung cho cảnh báo nhiệt độ + PD; các phần chỉ-PD (video, xu hướng, công thức) bật theo isPdNotification.
const formModelValue = ref<any>({
  id: null,
  compareResultObject: {},
  compareTypeObject: {},
  statusObject: {},
})

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
  // true khi render ở trang riêng (route .../detail) - hiện mũi tên quay lại danh sách.
  // false khi render trong drawer ngay trên trang danh sách - back-link không cần mũi tên vì không phải điều hướng chính.
  standalone: {
    type: Boolean,
    default: false,
  },
})

// Dùng var(--*) + color-mix thay vì hex cứng - đổi theo theme sáng/tối cùng lúc CSS đổi, không cần JS xử lý riêng.
const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  Good: { bg: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' },
  Fair: { bg: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' },
  Average: { bg: 'color-mix(in srgb, var(--warning) 14%, transparent)', color: 'var(--warning)' },
  Bad: { bg: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' },
}
const DEFAULT_SEVERITY = { bg: 'var(--bg-body)', color: 'var(--text-sub)' }

const isPdNotification = computed(() => formModelValue.value?.compareTypeObject?.code === 'PdGrowthRate')
const severity = computed(() => SEVERITY_COLORS[formModelValue.value?.compareResultObject?.code] ?? DEFAULT_SEVERITY)
const isResolved = computed(() => formModelValue.value?.statusObject?.code === 'Resolved')
const valueUnit = computed(() => (isPdNotification.value ? 'dB' : '°C'))
const componentValueLabel = computed(() => (isPdNotification.value ? 'Cường độ đo được' : 'Nhiệt độ đo được'))
const deltaLabel = computed(() => (isPdNotification.value ? 'Tốc độ tăng ΔPD% theo kỳ' : 'Chênh lệch'))
const deltaSuffix = computed(() => (isPdNotification.value ? '%' : '°C'))

const activeMedia = ref<'image' | 'video'>('image')
const videoLoadFailed = ref(false)

watch(
  () => props.formModel,
  (newVal) => {
    formModelValue.value = newVal
    videoLoadFailed.value = false
    activeMedia.value = 'image'
  },
  { immediate: true },
)

const videoUrl = computed(() => `${PATH_URL}/api/PdData/${formModelValue.value?.detailId}/video`)
const downloadVideoUrl = computed(() => `${videoUrl.value}?download=true`)

function goToMap() {
  router.push({ name: 'dashboard' })
}

// Dựa vào loại cảnh báo (không phải tên route) - component này còn được mở trong drawer ngay trên
// trang danh sách (route vẫn là notification_system/pd_notification_system), không chỉ ở trang riêng.
const backRouteName = computed(() => (isPdNotification.value ? 'pd_notification_system' : 'notification_system'))
function goBack() {
  router.push({ name: backRouteName.value })
}

// ThresholdType.PdLevelDb = 8 - đánh giá bằng ngưỡng dB tuyệt đối, không qua baseline.
const isDbCriteria = computed(() => formModelValue.value?.evaluationThresholdType === 8)

const hasFormula = computed(
  () =>
    isPdNotification.value &&
    !isDbCriteria.value &&
    formModelValue.value?.firstDetectedLevelDb != null &&
    formModelValue.value?.firstDetectedAt,
)
const hasDbCriteria = computed(() => isPdNotification.value && isDbCriteria.value)
const monthsElapsed = computed(() => {
  if (!formModelValue.value?.firstDetectedAt) return 0
  const first = new Date(formModelValue.value.firstDetectedAt).getTime()
  const current = new Date(formModelValue.value.dataTime).getTime()
  return (current - first) / (1000 * 60 * 60 * 24 * 30.44)
})

// Phải khớp Y HỆT PdDataRepository.DefaultDeltaPercentFormula (BE) để biết có phải mặc định hay không.
const DEFAULT_DELTA_FORMULA = '(current - first) / (first * months) * 100'
const PD_DOMAIN = 1
const allVariables = ref<{ name: string; label: string }[]>([])
onMounted(async () => {
  const res = await listFormulaVariablesApi({ domain: PD_DOMAIN })
  allVariables.value = ((res.data as any[]) ?? []).map((v) => ({ name: v.name, label: v.label }))
})
const appliedFormula = computed(() => formModelValue.value?.appliedDeltaPercentFormula || DEFAULT_DELTA_FORMULA)
const formulaLegendVariables = computed(() =>
  allVariables.value.filter((v) => new RegExp(`\\b${v.name}\\b`, 'i').test(appliedFormula.value)),
)
const isCustomFormula = computed(() => appliedFormula.value !== DEFAULT_DELTA_FORMULA)

// Snapshot {tên biến: giá trị} BE đã nạp vào NCalc lúc evaluate (PdDataDetail.AppliedFormulaVariablesJson) -
// null/lỗi parse (dữ liệu cũ trước migration) -> {} để rơi về fallback bên dưới.
const appliedFormulaVariables = computed<Record<string, number>>(() => {
  const raw = formModelValue.value?.appliedFormulaVariablesJson
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
})

// Đơn vị hiển thị theo Ý NGHĨA biến "cứng" (current/first/last=dB, days/months=đơn vị thời gian) - biến
// "tự tính" (VD pd_now) không có metadata đơn vị ở FE nên hiện giá trị thô, dựa vào label để người dùng hiểu.
function formatVariableValue(name: string, value: number | undefined): string {
  if (value == null) return '—'
  const key = name.toLowerCase()
  if (key === 'months') return `≈ ${value.toFixed(2)} tháng`
  if (key === 'days') return `${value} ngày`
  if (['current', 'first', 'last'].includes(key)) return `${value} dB`
  return `${value}`
}

// Danh sách dòng hiện trong "formula-rows": mỗi biến THỰC SỰ xuất hiện trong công thức đã áp dụng (không
// còn cố định first/current), kèm giá trị THỰC đã dùng (snapshot) - fallback về field cũ (first/current/
// months tính lại ở FE) khi đọc dữ liệu cũ chưa có snapshot.
const formulaRows = computed(() => {
  const vars = appliedFormulaVariables.value
  return formulaLegendVariables.value.map((v) => {
    const key = v.name.toLowerCase()
    let value = vars[v.name] ?? vars[key]
    if (value === undefined) {
      if (key === 'current') value = formModelValue.value?.componentValue
      else if (key === 'first') value = formModelValue.value?.firstDetectedLevelDb
      else if (key === 'months') value = monthsElapsed.value
    }
    let display = formatVariableValue(key, value)
    if (key === 'first' && formModelValue.value?.firstDetectedAt) display += ` · ${formatDate(formModelValue.value.firstDetectedAt)}`
    else if (key === 'current' && formModelValue.value?.dataTime) display += ` · ${formatDate(formModelValue.value.dataTime)}`
    return { name: v.name, label: v.label, display }
  })
})
// Nhãn theo mốc ĐÃ DÙNG (snapshot). Ngưỡng dB: mỗi mốc là điểm bắt đầu mức TIẾP THEO, nên nhãn lùi 1 mốc so với %.
const thresholdLabels = computed(() => {
  const m = formModelValue.value ?? {}
  if (isDbCriteria.value) {
    const good = m.thresholdGoodMax ?? 0
    const fair = m.thresholdFairMax ?? 0
    const average = m.thresholdAverageMax ?? 0
    return {
      good: `Tốt <${good}dB`,
      fair: `Khá ≥${good}dB`,
      average: `TB ≥${fair}dB`,
      bad: `Xấu ≥${average}dB`,
    }
  }
  const good = m.thresholdGoodMax ?? 0
  const fair = m.thresholdFairMax ?? 3
  const average = m.thresholdAverageMax ?? 5
  return {
    good: `Tốt ≤${good}%`,
    fair: `Khá ≤${fair}%`,
    average: `TB ≤${average}%`,
    bad: `Xấu >${average}%`,
  }
})
function levelChipStyle(code: string) {
  const c = SEVERITY_COLORS[code] ?? DEFAULT_SEVERITY
  const active = formModelValue.value?.compareResultObject?.code === code
  return active ? { background: c.color, color: '#fff', fontWeight: 700 } : { background: c.bg, color: c.color }
}
function formatDate(value: string) {
  if (!value) return ''
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// Sparkline xu hướng - tối đa 5 điểm (BE trả theo thời gian tăng dần), cần >=2 điểm mới vẽ được.
const trendPoints = computed(() => {
  const trend: { dataTime: string; levelDb: number }[] = formModelValue.value?.pdTrend ?? []
  if (trend.length < 2) return null
  const values = trend.map((t) => t.levelDb)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 420
  const h = 150
  const stepX = trend.length > 1 ? w / (trend.length - 1) : 0
  const coords = trend.map((t, i) => {
    const x = i * stepX
    const y = h - 12 - ((t.levelDb - min) / range) * (h - 24)
    return { x, y, levelDb: t.levelDb, dataTime: t.dataTime }
  })
  return {
    coords,
    polyline: coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' '),
    first: trend[0],
    last: trend[trend.length - 1],
    rising: trend[trend.length - 1].levelDb >= trend[0].levelDb,
  }
})

const { confirmModal } = useConfirmModal()
const emits = defineEmits(['updateStatus'])
function changeStatus() {
  confirmModal('Cập nhật trạng thái', 'Bạn có chắc muốn cập nhật trạng thái đã xử lý?', () => {
    updateNotificationStatusApi(formModelValue.value.id, {
      status: formModelValue.value.statusObject.code === 'Pending' ? 2 : 1,
      dataTime: formModelValue.value.dataTime,
    }).then(() => {
      notificationDetailApi({
        id: formModelValue.value.id,
        dataTime: formModelValue.value.dataTime,
      }).then((res) => {
        formModelValue.value = res.data
      })
      emits('updateStatus')
    })
  })
}
</script>

<template>
  <div class="detail-root">
    <div class="header">
      <div class="header__top">
        <div class="header__info">
          <button type="button" class="back-link" @click="goBack">
            <svg v-if="standalone" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15 7.5 10l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Chi tiết cảnh báo
          </button>
          <div class="header__badges">
            <span class="badge badge--severity" :style="{ background: severity.bg, color: severity.color }">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 6v4.5M10 13.2v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path
                  d="M8.7 2.9 1.4 15.5c-.4.7.1 1.5.9 1.5h15.4c.8 0 1.3-.8.9-1.5L11.3 2.9c-.4-.7-1.4-.7-1.8 0Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
              Mức {{ formModelValue?.compareResultObject?.name }}
            </span>
            <span class="badge badge--status" :class="{ 'badge--status-resolved': isResolved }">
              <span class="badge__dot" />
              {{ formModelValue?.statusObject?.name }}
            </span>
            <span class="header__meta">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.3" stroke="currentColor" stroke-width="1.5" />
                <path d="M10 6v4.3l3 1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Thời gian phát hiện: <strong>{{ formModelValue?.formattedDate }}</strong>
            </span>
          </div>
        </div>
        <div class="header__actions">
          <ElButton v-if="formModelValue?.statusObject?.code === 'Pending'" class="action-btn action-btn--primary" @click="changeStatus">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Cập nhật trạng thái
          </ElButton>
          <a v-if="isPdNotification" :href="downloadVideoUrl" download class="action-btn action-btn--secondary">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 3v9.5M6.2 9 10 12.8 13.8 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /><path d="M4 15.5h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            Tải video
          </a>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <div class="media-column">
        <div class="media-card">
          <div v-if="isPdNotification" class="tabs">
            <button type="button" class="tab-btn" :class="{ 'tab-btn--active': activeMedia === 'image' }" @click="activeMedia = 'image'">
              Ảnh chụp
            </button>
            <button type="button" class="tab-btn" :class="{ 'tab-btn--active': activeMedia === 'video' }" @click="activeMedia = 'video'">
              Video sự kiện
            </button>
          </div>

          <div v-if="!isPdNotification || activeMedia === 'image'" class="media-frame">
            <img v-if="formModelValue?.imagePath" :src="formModelValue?.imagePath" class="media-frame__img" alt="" />
            <div v-else class="media-placeholder">Không có hình ảnh</div>
          </div>
          <video
            v-else-if="!videoLoadFailed"
            :key="videoUrl"
            :src="videoUrl"
            controls
            class="media-frame__video"
            @error="videoLoadFailed = true"
          />
          <div v-else class="media-placeholder">Không có video</div>
        </div>

        <button v-if="isPdNotification" type="button" class="map-link" @click="goToMap">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path d="M10 18s6-5.2 6-9.8A6 6 0 0 0 4 8.2C4 12.8 10 18 10 18Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            <circle cx="10" cy="8.2" r="2.2" stroke="currentColor" stroke-width="1.5" />
          </svg>
          Xem trên bản đồ giám sát
        </button>

        <div v-if="isPdNotification && trendPoints" class="card trend-card">
          <div class="card__row-between">
            <h3 class="card__title">Xu hướng cường độ đo được</h3>
            <span class="muted-sm">{{ formModelValue.pdTrend.length }} lần đo gần nhất · Bộ phận này</span>
          </div>
          <div class="trend-chart">
            <svg width="100%" height="150" viewBox="0 0 420 150" preserveAspectRatio="none" class="trend-svg">
              <line x1="0" y1="30" x2="420" y2="30" stroke="var(--border)" stroke-width="1" />
              <line x1="0" y1="80" x2="420" y2="80" stroke="var(--border)" stroke-width="1" />
              <line x1="0" y1="128" x2="420" y2="128" stroke="var(--border)" stroke-width="1" />
              <polyline
                :points="trendPoints.polyline"
                fill="none"
                :stroke="severity.color"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                v-for="(c, i) in trendPoints.coords.slice(0, -1)"
                :key="i"
                :cx="c.x"
                :cy="c.y"
                r="4"
                fill="#cbd5e1"
              />
              <circle
                :cx="trendPoints.coords[trendPoints.coords.length - 1].x"
                :cy="trendPoints.coords[trendPoints.coords.length - 1].y"
                r="6"
                :fill="severity.color"
                stroke="#fff"
                stroke-width="2"
              />
            </svg>
            <div class="trend-summary">
              <div>
                <div class="field-label">Khoảng đo</div>
                <div class="trend-summary__range">{{ trendPoints.first.levelDb }} → {{ trendPoints.last.levelDb }} dB</div>
              </div>
              <div class="trend-summary__chip" :style="{ background: severity.bg, color: severity.color }">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path
                    v-if="trendPoints.rising"
                    d="M3 13.5 8.5 8l3.5 3.5L17 6M12.5 6H17v4.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    v-else
                    d="M3 6.5 8.5 12l3.5-3.5L17 14M12.5 14H17V9.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ trendPoints.rising ? 'Tăng' : 'Giảm' }}
              </div>
            </div>
          </div>
          <div class="trend-points">
            <div v-for="(c, i) in trendPoints.coords" :key="i" class="trend-points__item">
              <div class="muted-xs">{{ formatDate(c.dataTime) }}</div>
              <div class="trend-points__value" :class="{ 'trend-points__value--active': i === trendPoints.coords.length - 1 }">
                {{ c.levelDb }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-column">
        <div class="card">
          <h3 class="card__title">Vị trí &amp; thiết bị</h3>
          <div class="field-list">
            <div class="two-col-row">
              <div class="field-row">
                <div class="field-label">Khu vực</div>
                <div class="field-value">{{ formModelValue?.areaName || '—' }}</div>
              </div>
              <div v-if="isPdNotification" class="field-row">
                <div class="field-label">Vùng trên camera</div>
                <div class="field-value" :class="{ 'field-value--empty': !formModelValue?.zoneName }">
                  {{ formModelValue?.zoneName || '—' }}
                </div>
              </div>
            </div>
            <div class="two-col-row">
              <div class="field-row">
                <div class="field-label">Thiết bị</div>
                <div class="field-value">{{ formModelValue?.machineName || '—' }}</div>
              </div>
              <div class="field-row">
                <div class="field-label">Bộ phận</div>
                <div class="field-value" :class="{ 'field-value--empty': !formModelValue?.machineComponentName }">
                  {{ formModelValue?.machineComponentName || '—' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card__title">Đo lường &amp; đánh giá</h3>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="field-label">{{ componentValueLabel }}</div>
              <div class="stat-value">{{ formModelValue?.componentValue }} <span class="stat-unit">{{ valueUnit }}</span></div>
            </div>
            <div v-if="!isDbCriteria" class="stat-box" :style="{ background: severity.bg }">
              <div class="field-label">{{ deltaLabel }}</div>
              <div class="stat-value" :style="{ color: severity.color }">
                {{ formModelValue?.deltaValue }}<span class="stat-unit">{{ deltaSuffix }}</span>
              </div>
            </div>
          </div>
          <div v-if="!isPdNotification" class="compare-row">
            <div class="field-row">
              <div class="field-label">Điểm giám sát</div>
              <div class="field-value" :class="{ 'field-value--empty': !formModelValue?.compareMonitorPoint }">
                {{ formModelValue?.compareMonitorPoint || '—' }}
              </div>
            </div>
            <div class="field-row">
              <div class="field-label">Đối tượng so sánh</div>
              <div class="field-value" :class="{ 'field-value--empty': !formModelValue?.compareComponent }">
                {{ formModelValue?.compareComponent || '—' }}
              </div>
            </div>
          </div>
          <div v-else-if="isDbCriteria" class="hint-row hint-row--standalone">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" class="hint-icon">
              <circle cx="10" cy="10" r="7.3" stroke="currentColor" stroke-width="1.5" />
              <path d="M10 6.5v4l2.6 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="hint-text">
              Đánh giá theo <strong>ngưỡng dB</strong> của bộ phận, không so với điểm đo/thiết bị khác - xem chi tiết ở thẻ "Ngưỡng cường độ PD (dB)" bên dưới.
            </div>
          </div>
          <div v-else class="hint-row hint-row--standalone">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" class="hint-icon">
              <circle cx="10" cy="10" r="7.3" stroke="currentColor" stroke-width="1.5" />
              <path d="M10 6.5v4l2.6 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="hint-text">
              So với chính baseline của <strong>bộ phận</strong>.
            </div>
          </div>
        </div>

        <div v-if="hasDbCriteria" class="card">
          <h3 class="card__title">Ngưỡng cường độ PD (dB)</h3>
          <p class="hint-text mb-2">Ngưỡng dB áp dụng cho bộ phận này (riêng, hoặc theo loại bộ phận nếu chưa có ngưỡng riêng):</p>
          <div class="level-legend">
            <span class="level-chip" :style="levelChipStyle('Good')">{{ thresholdLabels.good }}</span>
            <span class="level-chip" :style="levelChipStyle('Fair')">{{ thresholdLabels.fair }}</span>
            <span class="level-chip" :style="levelChipStyle('Average')">{{ thresholdLabels.average }}</span>
            <span class="level-chip" :style="levelChipStyle('Bad')">{{ thresholdLabels.bad }}</span>
          </div>
        </div>

        <div v-if="isPdNotification && hasFormula" class="card">
          <h3 class="card__title">
            Công thức tính tốc độ tăng ΔPD% theo kỳ<template v-if="formModelValue.appliedFormulaName">: {{ formModelValue.appliedFormulaName }}</template>
          </h3>
          <div v-if="!isCustomFormula" class="formula-box">
            ΔPD% =
            <span class="formula-fraction">
              <span class="formula-fraction__top">Cường độ đo được − Cường độ phát hiện lần đầu</span>
              <span class="formula-fraction__bottom">Cường độ phát hiện lần đầu × Số tháng đã trôi qua</span>
            </span>
            × 100
          </div>
          <div v-else class="formula-box formula-box--custom">
            <code class="formula-box__code">{{ appliedFormula }}</code>
            <ul v-if="formulaLegendVariables.length" class="formula-legend">
              <li v-for="v in formulaLegendVariables" :key="v.name"><b>{{ v.name }}</b>: {{ v.label }}</li>
            </ul>
          </div>
          <div class="formula-rows">
            <div v-for="row in formulaRows" :key="row.name" class="formula-row">
              <span>{{ row.label }}</span>
              <span class="formula-row__value">{{ row.display }}</span>
            </div>
            <div class="formula-row formula-row--result">
              <span>Kết quả</span>
              <span :style="{ color: severity.color }">= {{ formModelValue.deltaValue }}%</span>
            </div>
          </div>
          <div class="level-legend">
            <span class="level-chip" :style="levelChipStyle('Good')">{{ thresholdLabels.good }}</span>
            <span class="level-chip" :style="levelChipStyle('Fair')">{{ thresholdLabels.fair }}</span>
            <span class="level-chip" :style="levelChipStyle('Average')">{{ thresholdLabels.average }}</span>
            <span class="level-chip" :style="levelChipStyle('Bad')">{{ thresholdLabels.bad }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.header {
  flex-shrink: 0;
  padding: 4px 4px 18px;
  border-bottom: 1px solid var(--border);
}
.header__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.header__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
}
.header__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-left: 14px;
  border-left: 1px solid var(--border);
  font-size: 0.8125rem;
  color: var(--text-sub);
}
.header__meta strong {
  color: var(--text-main);
  font-weight: 600;
}
.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.back-link {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}
.back-link:hover {
  color: var(--primary);
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 700;
}
.badge--status {
  background: var(--bg-body);
  color: var(--text-sub);
  font-weight: 600;
}
.badge--status-resolved {
  background: color-mix(in srgb, var(--success) 12%, transparent);
  color: var(--success);
}
.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.detail-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  gap: 24px;
  padding: 18px 4px;
}

.media-column {
  flex: 0 0 46%;
  max-width: 46%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.media-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card);
}
.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 1px solid var(--border);
}
.tab-btn {
  all: unset;
  cursor: pointer;
  padding: 8px 12px 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-sub);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab-btn--active {
  color: var(--text-main);
  border-bottom-color: var(--text-main);
}
.media-frame {
  height: 340px;
  background: #0f172a;
}
.media-frame__img {
  width: 100%;
  height: 340px;
  object-fit: contain;
  background: #0f172a;
  display: block;
}
.media-frame__video {
  width: 100%;
  max-height: 340px;
  background: #000;
  display: block;
}
.media-placeholder {
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.8125rem;
}

.map-link {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: flex-start;
  padding: 7px 4px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary);
}
.map-link:hover {
  text-decoration: underline;
}

.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 18px 20px;
}
.card__title {
  margin: 0 0 14px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-main);
}
.card__row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.trend-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.trend-chart {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 28px;
  min-height: 90px;
}
.trend-svg {
  flex: 1;
  min-width: 0;
}
.trend-summary {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 130px;
}
.trend-summary__range {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-main);
}
.trend-summary__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  width: fit-content;
}
.trend-points {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--border);
}
.trend-points__item {
  text-align: center;
}
.trend-points__value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-main);
}
.trend-points__value--active {
  font-weight: 700;
}

.info-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.two-col-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.field-label {
  font-size: 0.75rem;
  color: var(--text-sub);
}
.field-value {
  font-size: 0.9375rem;
  color: var(--text-main);
  font-weight: 500;
}
.field-value--empty {
  color: var(--text-sub);
}
.hint-icon {
  color: var(--text-sub);
  flex-shrink: 0;
  margin-top: 1px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}
.stat-box {
  background: var(--bg-body);
  border-radius: 10px;
  padding: 14px 16px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
}
.stat-unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-sub);
  margin-left: 2px;
}

.compare-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding-top: 14px;
  margin-top: 2px;
  border-top: 1px solid var(--border);
}

.hint-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
}
.hint-row--standalone {
  margin-top: 0;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.hint-text {
  font-size: 0.8125rem;
  color: var(--text-sub);
  line-height: 1.5;
}
.hint-text strong {
  color: var(--text-main);
}

.formula-box {
  background: var(--bg-body);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 0.875rem;
  color: var(--text-main);
  line-height: 1.7;
  margin-bottom: 14px;
  text-align: center;
}
.formula-box--custom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.formula-box__code {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 0.8125rem;
  color: var(--text-main);
  background: var(--bg-card);
  border-radius: 6px;
  padding: 4px 10px;
}
.formula-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 14px;
  row-gap: 4px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.75rem;
  color: var(--text-sub);
}
.formula-legend b {
  color: var(--primary);
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
}
.formula-fraction {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 6px;
}
.formula-fraction__top {
  display: block;
  border-bottom: 1.5px solid var(--text-main);
  padding: 0 4px 2px;
}
.formula-fraction__bottom {
  display: block;
  padding: 2px 4px 0;
}
.formula-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8125rem;
  margin-bottom: 12px;
}
.formula-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-sub);
}
.formula-row__value {
  color: var(--text-main);
  font-weight: 600;
}
.formula-row--result {
  padding-top: 8px;
  border-top: 1px dashed var(--border);
  color: var(--text-main);
  font-weight: 600;
}

.level-legend {
  display: flex;
  gap: 6px;
}
.level-chip {
  flex: 1;
  text-align: center;
  padding: 6px 4px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.action-btn {
  flex: 0 0 auto;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 16px !important;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}
.action-btn svg {
  flex-shrink: 0;
  margin-right: 8px;
}
.action-btn--primary {
  background-color: var(--success) !important;
  border-color: var(--success) !important;
  color: #fff !important;
}
.action-btn--primary:hover {
  filter: brightness(0.9);
}
.action-btn--secondary {
  border-color: var(--border);
  color: var(--text-main);
}
.action-btn--secondary:hover {
  background: var(--bg-body);
}

.muted-sm {
  font-size: 0.75rem;
  color: var(--text-sub);
}
.muted-xs {
  font-size: 0.6875rem;
  color: var(--text-sub);
}

@media (max-width: 720px) {
  .detail-body {
    flex-direction: column;
    overflow-y: auto;
  }
  .media-column {
    flex: 0 0 auto;
    max-width: 100%;
  }
  .info-column {
    flex: 0 0 auto;
    overflow-y: visible;
  }
  .media-frame,
  .media-frame__img,
  .media-frame__video,
  .media-placeholder {
    height: 220px;
  }
  .two-col-row,
  .compare-row {
    grid-template-columns: 1fr;
  }
  .trend-chart {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
