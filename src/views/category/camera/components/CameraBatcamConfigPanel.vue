<template>
  <div class="flex flex-col gap-5 batcam-config">
    <!-- 1. ROI -->
    <section>
      <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h3 class="section-title">1. {{ t('batcam.roiConfig') }}</h3>
      </div>

      <div
          ref="videoContainerRef"
          v-loading="videoLoading"
          class="roi-canvas-wrapper"
          :style="{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }"
      >
        <svg
            class="roi-overlay"
            :class="{ 'roi-overlay--picking': drawingIndex !== null }"
            :viewBox="`0 0 ${naturalWidth} ${naturalHeight}`"
            preserveAspectRatio="none"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
        >
          <template v-for="(roi, i) in rois" :key="i">
            <g v-if="roi.cx !== null && (i !== drawingIndex || !dragRect)">
              <rect
                  :x="(roi.cx - (roi.nw ?? 0) / 2) * naturalWidth"
                  :y="((roi.cy ?? 0) - (roi.nh ?? 0) / 2) * naturalHeight"
                  :width="(roi.nw ?? 0) * naturalWidth"
                  :height="(roi.nh ?? 0) * naturalHeight"
                  class="roi-shape"
                  :class="[
                    `roi-shape--${i % ROI_COLOR_COUNT}`,
                    i === activeRoiIndex ? 'roi-shape--active' : 'roi-shape--dim',
                  ]"
              />
              <text
                  :x="roi.cx * naturalWidth"
                  :y="((roi.cy ?? 0) - (roi.nh ?? 0) / 2) * naturalHeight - 6"
                  class="roi-label"
              >{{ roiLabel(roi) }}</text>
            </g>
          </template>

          <rect v-if="dragRect" v-bind="dragRect" class="roi-shape roi-shape--drawing" />
        </svg>
      </div>

      <!-- Mỗi ROI một tab (name = vị trí trong rois); dữ liệu nằm sẵn trong rois nên đổi tab không mất giá trị chưa lưu. -->
      <el-tabs
          v-if="rois.length"
          v-model="activeRoiTab"
          class="mt-4 roi-tabs"
          :class="`roi-tabs--${activeRoiIndex % ROI_COLOR_COUNT}`"
      >
        <el-tab-pane v-for="(row, index) in rois" :key="index" :name="String(index)">
          <template #label>
            <span class="font-semibold roi-index-label" :class="`roi-index-label--${index % ROI_COLOR_COUNT}`">ROI {{ row.roiIndex + 1 }}</span>
          </template>

          <div class="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div class="flex items-center gap-2">
              <span v-if="row.cx !== null" class="text-xs muted-text">
                {{ t('map.coordinates') }}: cx={{ row.cx!.toFixed(3) }}, cy={{ row.cy!.toFixed(3) }}, nw={{ row.nw!.toFixed(3) }}, nh={{ row.nh!.toFixed(3) }}
              </span>
              <span v-else class="text-xs muted-text">{{ t('batcam.notDrawn') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <el-button
                  size="small"
                  :type="drawingIndex === index ? 'warning' : undefined"
                  :class="{ 'roi-customize-btn': drawingIndex !== index }"
                  @click="startDrawing(index)"
              ><el-icon class="mr-1"><Rank /></el-icon>{{ drawingIndex === index ? t('batcam.drawing') : t('batcam.customize') }}</el-button>
              <span class="text-xs muted-text">{{ t('batcam.enable') }}</span>
              <el-switch v-model="row.enabled" size="small" class="roi-enable-switch" active-color="#409eff" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <el-input v-model="row.name" size="small" :placeholder="t('batcam.displayNamePlaceholder')" />
            <el-select v-model="row.machineId" size="small" :placeholder="t('batcam.selectEquipment')" filterable @change="() => onMachineChange(row)">
              <el-option v-for="m in machineOptions" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
            <el-select
                v-model="row.machineComponentId"
                size="small"
                :placeholder="t('batcam.selectComponent')"
                filterable
                :disabled="!row.machineId"
                @change="(val: number) => (row.machineComponentName = row.componentOptions.find((c) => c.id === val)?.name ?? null)"
            >
              <el-option v-for="c in row.componentOptions" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </div>
        </el-tab-pane>
      </el-tabs>
      <span v-else class="text-xs muted-text block mt-4">{{ t('batcam.noRoi') }}</span>
    </section>

    <!-- 2. PD AI / 3. Chùm tia -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section v-loading="aiLoading">
        <h3 class="section-title mb-5">2. {{ t('batcam.pdAiConfig') }}</h3>
        <div class="beam-slider-group">
          <div class="beam-slider beam-slider--switch">
            <span class="beam-slider__label">{{ t('batcam.enableConfig') }}</span>
            <el-switch v-model="aiSetting.pd.enabled" class="pd-enable-switch" />
          </div>
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">{{ t('batcam.frames') }}</span>
              <span class="beam-slider__value">{{ aiSetting.pd.windowSize }}</span>
            </div>
            <el-slider v-model="aiSetting.pd.windowSize" :min="1" :max="50" :step="1" />
          </div>
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">{{ t('batcam.scoreThreshold') }}</span>
              <span class="beam-slider__value">{{ aiSetting.pd.confidenceThreshold.toFixed(2) }}</span>
            </div>
            <el-slider v-model="aiSetting.pd.confidenceThreshold" :min="0" :max="1" :step="0.05" />
          </div>
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">{{ t('batcam.triggerRate') }}</span>
              <span class="beam-slider__value">{{ aiSetting.pd.triggerRate.toFixed(2) }}</span>
            </div>
            <el-slider v-model="aiSetting.pd.triggerRate" :min="0" :max="1" :step="0.05" />
          </div>
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">{{ t('batcam.cooldown') }}</span>
              <span class="beam-slider__value">{{ aiSetting.pd.eventCooldown }}s</span>
            </div>
            <el-slider v-model="aiSetting.pd.eventCooldown" :min="0" :max="300" :step="1" />
          </div>
        </div>

        <!-- LEAK tạm ẩn, đổi SHOW_LEAK_CONFIG để bật. -->
        <template v-if="SHOW_LEAK_CONFIG">
          <el-divider class="!my-3" />
          <h3 class="section-title mb-3">{{ t('batcam.leakAiConfig') }}</h3>
          <el-form label-width="160px" label-position="left" size="small">
            <el-form-item :label="t('batcam.enableEvaluation')">
              <el-switch v-model="aiSetting.leak.enabled" />
            </el-form-item>
            <el-form-item :label="t('batcam.frames')">
              <el-input-number v-model="aiSetting.leak.windowSize" :min="1" controls-position="right" class="w-full" />
            </el-form-item>
            <el-form-item :label="t('batcam.scoreThreshold')">
              <el-input-number v-model="aiSetting.leak.confidenceThreshold" :min="0" :max="1" :step="0.05" controls-position="right" class="w-full" />
            </el-form-item>
            <el-form-item :label="t('batcam.triggerRate')">
              <el-input-number v-model="aiSetting.leak.triggerRate" :min="0" :max="1" :step="0.05" controls-position="right" class="w-full" />
            </el-form-item>
            <el-form-item :label="t('batcam.cooldown')">
              <el-input-number v-model="aiSetting.leak.eventCooldown" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-form>
        </template>
      </section>

      <section v-loading="measurementLoading">
        <h3 class="section-title mb-5">3. {{ t('batcam.beamConfig') }}</h3>
        <div class="beam-slider-group">
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">{{ t('batcam.frequencyRange') }}</span>
              <span class="beam-slider__value">{{ frequencyRange[0] }}Hz ~ {{ frequencyRange[1] }}Hz</span>
            </div>
            <el-slider v-model="frequencyRange" range :min="100" :max="98999" :step="100" />
          </div>
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">{{ t('batcam.distance') }}</span>
              <span class="beam-slider__value">{{ measurement.distance }}m</span>
            </div>
            <el-slider v-model="measurement.distance" :min="0.1" :max="10" :step="0.1" />
          </div>
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">X-Cal</span>
              <span class="beam-slider__value">{{ measurement.xCal.toFixed(2) }}</span>
            </div>
            <el-slider v-model="measurement.xCal" :min="-2" :max="2" :step="0.01" />
          </div>
          <div class="beam-slider">
            <div class="beam-slider__header">
              <span class="beam-slider__label">Y-Cal</span>
              <span class="beam-slider__value">{{ measurement.yCal.toFixed(2) }}</span>
            </div>
            <el-slider v-model="measurement.yCal" :min="-2" :max="2" :step="0.01" />
          </div>
        </div>
      </section>
    </div>

    <el-divider class="!my-0" />

    <!-- Một nút lưu cho cả panel -->
    <div class="flex justify-end">
      <el-button type="primary" :loading="savingAll" @click="saveAllConfig">{{ t('batcam.saveAll') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Rank } from '@element-plus/icons-vue'
import { prepareCameraStream } from '@/plugins/webRTC/cameraStream'
import { getAllMachineApi, getComponentMachineApi } from '@/api/machine'
import {
  getBatcamRoisApi,
  saveBatcamRoiApi,
  getBatcamAiSettingApi,
  saveBatcamAiSettingApi,
  getBatcamMeasurementSettingApi,
  saveBatcamMeasurementSettingApi,
} from '@/api/batcam-config'

const { t } = useLang()

const props = defineProps<{
  formModel: { id?: number; areaId?: number }
}>()

// Tạm ẩn form LEAK; dữ liệu/API vẫn tải và gửi đủ để không mất giá trị trên thiết bị.
const SHOW_LEAK_CONFIG = false

const cameraId = () => props.formModel?.id

// ── Video trực tiếp ──

const videoContainerRef = ref<HTMLElement>()
const videoLoading = ref(true)
const naturalWidth = ref(1920)
const naturalHeight = ref(1080)

const initVideo = () => {
  const id = cameraId()
  if (!id) return
  videoLoading.value = true
  const videoStream = document.createElement('video-stream') as any
  prepareCameraStream(videoStream, id)
      .then(() => {
        videoStream.style.display = 'block'
        videoStream.style.width = '100%'
        videoStream.style.height = '100%'
        // video-stream chèn <video> đè lên SVG; cho click xuyên qua để SVG nhận sự kiện kéo-vẽ ROI.
        videoStream.style.pointerEvents = 'none'

        videoStream.addEventListener('stream-onopen', () => {
          videoLoading.value = false
          const video = videoStream.video as HTMLVideoElement | undefined
          if (video) {
            video.style.objectFit = 'contain'
            video.style.width = '100%'
            video.style.height = '100%'
            if (video.videoWidth && video.videoHeight) {
              naturalWidth.value = video.videoWidth
              naturalHeight.value = video.videoHeight
            }
          }
        })
        videoStream.addEventListener('stream-error', () => {
          videoLoading.value = false
          ElMessage.error(t('batcam.streamConnectFailed'))
        })

        videoContainerRef.value?.appendChild(videoStream)
      })
      .catch(() => {
        videoLoading.value = false
        ElMessage.error(t('batcam.streamFailed'))
      })
}

// ── ROI ───────────────────────────────────────────────────────────────

interface RoiRow {
  roiIndex: number
  cx: number | null
  cy: number | null
  nw: number | null
  nh: number | null
  enabled: boolean
  machineId: number | null
  machineComponentId: number | null
  machineComponentName: string | null
  name: string
  componentOptions: any[]
}

const emptyRoi = (index: number): RoiRow => ({
  roiIndex: index,
  cx: null,
  cy: null,
  nw: null,
  nh: null,
  enabled: true,
  machineId: null,
  machineComponentId: null,
  machineComponentName: null,
  name: '',
  componentOptions: [],
})

// Nhãn hiển thị trên video: ưu tiên tên tự đặt (row.name) -> tên bộ phận đã gán -> "ROI n" mặc định.
const roiLabel = (row: RoiRow) => row.name || row.machineComponentName || `ROI ${row.roiIndex + 1}`

// Số màu ROI có trong CSS; ROI thứ n dùng màu n % số này.
const ROI_COLOR_COUNT = 3

// Danh sách ROI lấy từ thiết bị.
const rois = ref<RoiRow[]>([])
const machineOptions = ref<any[]>([])

// Tab ROI đang mở (name = vị trí trong rois); ROI đó được làm nổi trên video.
const activeRoiTab = ref('0')
const activeRoiIndex = computed(() => Number(activeRoiTab.value))

const loadRois = async () => {
  const id = cameraId()
  if (!id) return
  try {
    const res = await getBatcamRoisApi(id)
    const items = [...((res.data ?? []) as any[])].sort((a, b) => a.roiIndex - b.roiIndex)
    // Tải bộ phận của từng ROI xong mới gán, để các dòng luôn đủ dữ liệu khi render.
    rois.value = await Promise.all(
        items.map(async (item) => {
          const compRes = item.machineId
              ? await getComponentMachineApi({ machineId: item.machineId, hasMonitorPoints: false })
              : null
          return {
            ...emptyRoi(item.roiIndex),
            cx: item.cx,
            cy: item.cy,
            nw: item.nw,
            nh: item.nh,
            enabled: item.enabled,
            machineId: item.machineId,
            machineComponentId: item.machineComponentId,
            machineComponentName: item.machineComponentName ?? null,
            name: item.name ?? '',
            componentOptions: compRes?.data ?? [],
          }
        }),
    )
    activeRoiTab.value = '0'
  } catch {
    ElMessage.error(t('batcam.roiFailed'))
  }
}

const onMachineChange = async (row: RoiRow) => {
  row.machineComponentId = null
  row.componentOptions = []
  if (!row.machineId) return
  const res = await getComponentMachineApi({ machineId: row.machineId, hasMonitorPoints: false })
  row.componentOptions = res.data ?? []
}

// Không tự bắt lỗi: saveAllConfig quyết định dừng khi 1 bước đồng bộ thất bại.
const saveRoi = async (row: RoiRow) => {
  const id = cameraId()
  if (!id || row.cx === null || !row.machineComponentId) return
  const res = await saveBatcamRoiApi(id, row.roiIndex, {
    cx: row.cx,
    cy: row.cy,
    nw: row.nw,
    nh: row.nh,
    enabled: row.enabled,
    machineId: row.machineId,
    machineComponentId: row.machineComponentId,
    name: row.name || null,
  })
  const saved = res.data
  if (saved) {
    row.cx = saved.cx
    row.cy = saved.cy
    row.nw = saved.nw
    row.nh = saved.nh
    row.enabled = saved.enabled
    row.machineComponentName = saved.machineComponentName ?? null
  }
}

// ── Vẽ ROI bằng kéo chuột trên video ─────────────────────────────────────

const drawingIndex = ref<number | null>(null)
const dragStartPoint = ref<{ x: number; y: number } | null>(null)
const dragCurrentPoint = ref<{ x: number; y: number } | null>(null)

const dragRect = computed(() => {
  if (!dragStartPoint.value || !dragCurrentPoint.value) return null
  const x = Math.min(dragStartPoint.value.x, dragCurrentPoint.value.x)
  const y = Math.min(dragStartPoint.value.y, dragCurrentPoint.value.y)
  const width = Math.abs(dragCurrentPoint.value.x - dragStartPoint.value.x)
  const height = Math.abs(dragCurrentPoint.value.y - dragStartPoint.value.y)
  return { x, y, width, height }
})

const startDrawing = (index: number) => {
  // Bấm lại "Tùy chỉnh" của ROI đang vẽ = tắt chế độ vẽ.
  if (drawingIndex.value === index) {
    stopDrawing()
    return
  }
  drawingIndex.value = index
  activeRoiTab.value = String(index)
  dragStartPoint.value = null
  dragCurrentPoint.value = null
}

const svgPoint = (svg: SVGSVGElement, event: MouseEvent) => {
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const p = point.matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

const onMouseDown = (event: MouseEvent) => {
  if (drawingIndex.value === null) return
  const p = svgPoint(event.currentTarget as SVGSVGElement, event)
  if (!p) return
  dragStartPoint.value = p
  dragCurrentPoint.value = p
}

const onMouseMove = (event: MouseEvent) => {
  if (drawingIndex.value === null || !dragStartPoint.value) return
  const p = svgPoint(event.currentTarget as SVGSVGElement, event)
  if (p) dragCurrentPoint.value = p
}

// Kết thúc 1 lần kéo nhưng giữ chế độ vẽ để kéo tiếp. Thoát: bấm lại "Tùy chỉnh", đổi tab ROI hoặc Lưu.
const onMouseUp = () => {
  if (drawingIndex.value === null || !dragStartPoint.value || !dragCurrentPoint.value) return
  const rect = dragRect.value
  if (rect && rect.width > 4 && rect.height > 4) {
    const row = rois.value[drawingIndex.value]
    row.cx = (rect.x + rect.width / 2) / naturalWidth.value
    row.cy = (rect.y + rect.height / 2) / naturalHeight.value
    row.nw = rect.width / naturalWidth.value
    row.nh = rect.height / naturalHeight.value
  }
  dragStartPoint.value = null
  dragCurrentPoint.value = null
}

const stopDrawing = () => {
  drawingIndex.value = null
  dragStartPoint.value = null
  dragCurrentPoint.value = null
}

// Đổi sang tab ROI khác thì thoát chế độ vẽ.
watch(activeRoiTab, (tab) => {
  if (drawingIndex.value !== null && String(drawingIndex.value) !== tab) stopDrawing()
})

// ── Ngưỡng đánh giá AI (PD/LEAK) ──────────────────────────────────────────

interface AiModelForm {
  enabled: boolean
  windowSize: number
  triggerRate: number
  confidenceThreshold: number
  eventCooldown: number
}
const defaultAiModel = (): AiModelForm => ({ enabled: false, windowSize: 10, triggerRate: 0.7, confidenceThreshold: 0.6, eventCooldown: 10 })
const aiSetting = ref<{ pd: AiModelForm; leak: AiModelForm }>({ pd: defaultAiModel(), leak: defaultAiModel() })
const aiLoading = ref(false)

const loadAiSetting = async () => {
  const id = cameraId()
  if (!id) return
  aiLoading.value = true
  try {
    const res = await getBatcamAiSettingApi(id)
    if (res.data) {
      aiSetting.value.pd = { ...res.data.pd }
      aiSetting.value.leak = { ...res.data.leak }
    }
  } catch {
    ElMessage.error(t('batcam.aiFailed'))
  } finally {
    aiLoading.value = false
  }
}

// Không tự bắt lỗi (xem saveRoi).
const saveAiSetting = async () => {
  const id = cameraId()
  if (!id) return
  const res = await saveBatcamAiSettingApi(id, { pd: aiSetting.value.pd, leak: aiSetting.value.leak })
  if (res.data) {
    aiSetting.value.pd = { ...res.data.pd }
    aiSetting.value.leak = { ...res.data.leak }
  }
}

// ── Dải tần đo / khoảng cách ───────────────────────────────────────────

const measurement = ref({ lowCut: 20000, highCut: 60000, distance: 1, xCal: 0, yCal: 0 })
const measurementLoading = ref(false)

// el-slider range cần v-model dạng [min, max].
const frequencyRange = computed<[number, number]>({
  get: (): [number, number] => [measurement.value.lowCut, measurement.value.highCut],
  set: ([lowCut, highCut]) => {
    measurement.value.lowCut = lowCut
    measurement.value.highCut = highCut
  },
})

const loadMeasurementSetting = async () => {
  const id = cameraId()
  if (!id) return
  measurementLoading.value = true
  try {
    const res = await getBatcamMeasurementSettingApi(id)
    if (res.data) {
      measurement.value = {
        lowCut: res.data.lowCut,
        highCut: res.data.highCut,
        distance: res.data.distance,
        xCal: res.data.xCal,
        yCal: res.data.yCal,
      }
    }
  } catch {
    ElMessage.error(t('batcam.beamFailed'))
  } finally {
    measurementLoading.value = false
  }
}

// Không tự bắt lỗi/hiện toast riêng - cùng lý do với saveRoi (xem comment ở đó).
const saveMeasurementSetting = async () => {
  const id = cameraId()
  if (!id) return
  const res = await saveBatcamMeasurementSettingApi(id, { ...measurement.value })
  if (res.data) {
    measurement.value = {
      lowCut: res.data.lowCut,
      highCut: res.data.highCut,
      distance: res.data.distance,
      xCal: res.data.xCal,
      yCal: res.data.yCal,
    }
  }
}

// ── Lưu tất cả (1 nút duy nhất cho cả panel) ────────────────────────────

const savingAll = ref(false)

const saveAllConfig = async () => {
  const id = cameraId()
  if (!id) return
  stopDrawing()
  savingAll.value = true
  try {
    // Tuần tự, dừng khi 1 bước lỗi; interceptor axios đã hiện thông báo lỗi.
    for (const row of rois.value) {
      if (row.cx !== null && row.machineComponentId) await saveRoi(row)
    }
    await saveAiSetting()
    await saveMeasurementSetting()
    ElMessage.success(t('batcam.saved'))
  } finally {
    savingAll.value = false
  }
}

// ── Khởi tạo ──────────────────────────────────────────────────────────

const init = async () => {
  const res = await getAllMachineApi({ areaId: props.formModel?.areaId })
  machineOptions.value = res.data ?? []
  initVideo()
  await loadRois()
  await loadAiSetting()
  await loadMeasurementSetting()
}

init()
</script>

<style scoped>
.batcam-config {
  padding: 8px 12px 16px;
  color: var(--text-main);
}
/* --el-color-primary bị site ép xanh lá; ép xanh dương để nút không lẫn với nút Lưu. */
.roi-customize-btn {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}
.roi-customize-btn:hover,
.roi-customize-btn:focus {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}
/* active-color không thắng CSS nội bộ của el-switch, ép qua :deep(). */
:deep(.roi-enable-switch.is-checked .el-switch__core),
:deep(.pd-enable-switch.is-checked .el-switch__core) {
  background-color: #409eff !important;
  border-color: #409eff !important;
}
.section-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-main);
  /* Chỉ reset margin-top; shorthand margin sẽ đè mb-* của Tailwind. */
  margin-top: 0;
}
.muted-text {
  color: var(--text-sub);
}
.beam-slider-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.beam-slider--switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.beam-slider__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
  line-height: 1.2;
}
/* Đồng bộ style với label của el-form size="small" bên cạnh. */
.beam-slider__label,
.beam-slider__value {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-sub);
}
/* Thu nhỏ track/tay kéo mặc định cho gọn. */
.beam-slider :deep(.el-slider__runway) {
  height: 4px;
}
.beam-slider :deep(.el-slider__bar) {
  height: 4px;
  /* Ép xanh dương như trên. */
  background-color: #409eff;
}
.beam-slider :deep(.el-slider__button) {
  width: 14px;
  height: 14px;
  border-color: #409eff;
}
/* Khung video luôn nền đen bất kể theme, giống mọi trình xem video khác trong app. */
.roi-canvas-wrapper {
  position: relative;
  width: 100%;
  max-height: 60vh;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}
.roi-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.roi-overlay--picking {
  cursor: crosshair;
}
/* Màu vẽ ROI đè lên video - cố định, không theo theme trang (giống overlay của mọi trình xem video). */
.roi-shape {
  fill: rgba(64, 158, 255, 0.15);
  stroke: #409eff;
  stroke-width: 3;
}
/* Khung bọc thanh tab + nội dung; gạch chân tab đang mở theo màu ROI (--roi-color). */
.roi-tabs {
  --roi-color: #409eff;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 12px 12px;
}
.roi-tabs--1 {
  --roi-color: #67c23a;
}
.roi-tabs--2 {
  --roi-color: #e6a23c;
}
.roi-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--roi-color);
}
/* ROI của tab đang mở: viền dày hơn; các ROI còn lại mờ đi. */
.roi-shape--active {
  stroke-width: 5;
}
.roi-shape--dim {
  opacity: 0.4;
}
.roi-shape--1 {
  fill: rgba(103, 194, 58, 0.15);
  stroke: #67c23a;
}
.roi-shape--2 {
  fill: rgba(230, 162, 60, 0.15);
  stroke: #e6a23c;
}
.roi-index-label--0 {
  color: #409eff;
}
.roi-index-label--1 {
  color: #67c23a;
}
.roi-index-label--2 {
  color: #e6a23c;
}
.roi-shape--drawing {
  fill: rgba(245, 108, 108, 0.25);
  stroke: #f56c6c;
  stroke-dasharray: 6 4;
}
.roi-label {
  fill: #fff;
  font-size: 20px;
  text-anchor: middle;
  paint-order: stroke;
  stroke: #000;
  stroke-width: 4px;
}
</style>
