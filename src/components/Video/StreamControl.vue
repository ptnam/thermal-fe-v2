<script setup lang="ts">

import {nextTick, onMounted, onUnmounted, ref} from "vue";
import {getCameraDetailApi, getStreamApi, sendCommandCameraApi} from "@/api/camera";

import useRequest from "@/hooks/web/useRequest";
import {CAMERA_COMMANDS} from "@/constants/camera";
import {PolygonDrawer} from "@/utils/PolygonDrawer";
import {thermalDataByAreaApi} from "@/api/thermal-data";

const props = defineProps({
  streamKey: {
    required: true,
  },
  startDraw: {
    type:Boolean,
    default: false
  },
  showBtnBack: {
    type:Boolean,
    default: true
  }
})

const videoRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const videoLoading = ref(true)
const videoStream = document.createElement('video-stream') as any
videoStream.addEventListener('stream-onopen', () => {
  videoLoading.value = false
  if(props.startDraw) {
    startDrawing();
  }
})
videoStream.addEventListener('stream-error', () => {
  videoLoading.value = false
})
const isPlaying = ref(false)
const isDrawing = ref(false)
const loading = ref(false)
const cam = ref<any>({});
const preCommand = ref();
const {onRequest} = useRequest();
const requestCommand = (command: number, other: any = null) => {
  onRequest(sendCommandCameraApi, {
    cameraId: props.streamKey,
    speed: speed.value,
    command: command,
    preCommand: preCommand.value
  })
  preCommand.value = command
  console.log(other)
}
const speed = ref(3);
onMounted(() => {
  loading.value = true
  getStreamApi(props.streamKey)
      .then((res) => {
        const key = res.data
        const path = import.meta.env.VITE_LIVE_PATH
        videoStream.src = new URL(`${path}?src=${key}`)
        videoRef?.value?.appendChild(videoStream)

        const video = videoStream.video
        video.addEventListener('waiting', () => {
          isPlaying.value = false
        })
        video.addEventListener('playing', () => {
          isPlaying.value = true
        })
        video.addEventListener('pause', () => {
          isPlaying.value = false
        })
      })
      .finally(() => {
        loading.value = false
      });

  getCameraDetailApi(props.streamKey).then(res => {
    cam.value = res.data
  });
});

const press = (command) => requestCommand(CAMERA_COMMANDS[command])
const release = (command) => requestCommand(CAMERA_COMMANDS.Stop, command)

const videoWidth = ref(0)
const videoHeight = ref(0)
let drawer: PolygonDrawer | null = null
const pointValues = ref<any>([])
const emits = defineEmits(['pointedClicked'])

function startDrawing(ranges = []) {
  isDrawing.value = true
  nextTick(() => {
    const c = canvasRef.value
    const v = videoRef.value?.querySelector('video') as HTMLVideoElement
    if (c && v) {
      // const rect = v.getBoundingClientRect()

      // size canvas theo video thật
      c.width = v.clientWidth
      c.height = v.clientHeight

      videoWidth.value = v.clientWidth
      videoHeight.value = v.clientHeight
      if (!drawer) {
        drawer = new PolygonDrawer(
            c,
            (_points) => {
              isDrawing.value = false
            },
            (points) => {
              pointValues.value = points
              emits("pointedClicked", points);
              nextTick(() => {
                if (points.length >= 3 && !drawer?.isConvex()) {
                  drawer?.showFullScreenAlert(videoRef, 'không phải hình đa giác lồi, vui lòng vẽ lại!')
                }
              })
            },
        );
        if (ranges.length) {
          drawer.loadRanges(ranges)
        }
      }

      drawer.removeAllPoint() // always start fresh
      drawer.start()
    }
  })
}

const stopDrawing = () => {
  drawer?.removeAllPoint();
  isDrawing.value = false
  visibleMeasurement.value = false

  if (timerId.value) {
    clearInterval(timerId.value);
  }
}

const clearAllPoint = () => {
  drawer?.removeAllPoint();
}

const clearPoint = () => {
  drawer?.removePoint();
}

const timerId = ref(0);
onUnmounted(() => {
  if (timerId.value) {
    clearInterval(timerId.value);
  }
});

function measureTemp() {
  if (timerId.value) {
    clearInterval(timerId.value);
  }
  measureTempAction();
  timerId.value = setInterval(() => {
    measureTempAction();
  }, 10000);
}

const {onRequest: measureTempRequest, isLoading: measureTempLoading} = useRequest()
const visibleMeasurement = ref(false)
const measurementResult = ref()

function measureTempAction() {
  measureTempRequest(thermalDataByAreaApi, {
    videoWidth: videoWidth.value,
    videoHeight: videoHeight.value,
    cameraId: props.streamKey,
    points: pointValues.value,
  })
      .then((res) => {
        visibleMeasurement.value = true;
        measurementResult.value = res.data;
      })
      .catch((e) => {
        drawer?.showFullScreenAlert(videoRef, e.toString())
      })
}

const loadRanges = (ranges) => {
  if(drawer) {
    drawer.loadRanges(ranges)
  }
}

defineExpose({
  startDrawing,
  clearAllPoint,
  clearPoint,
  videoRef,
  loadRanges
})
</script>
<template>
  <header class="live-header">
    <div style="display:flex; align-items:center; gap:15px">
      <router-link v-show="showBtnBack" class="v-btn" title="Thu nhỏ / Quay lại"
                   style="text-decoration: none;
    background: rgba(255, 255, 255, 0.05);
    width: 36px;
    height: 36px;" to="/live">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"></path>
        </svg>
      </router-link>
      <div class="cam-title">
        <svg width="20" height="20" viewBox="0 0 24 24" style="color:var(--primary)">
          <path
              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path>
        </svg>
        <div>
          <div style="line-height:1.2">{{ cam?.code }}</div>
          <div style="font-size:11px; color:var(--text-sub); font-weight:400">{{ cam?.area?.name }}</div>
        </div>
      </div>
    </div>
    <div style="display:flex; gap:15px; align-items:center">
      <div class="live-badge">LIVE FEED</div>
      <div style="font-family:'JetBrains Mono'; font-size:13px; color:#94A3B8"></div>
    </div>
  </header>
  <div class="live-container">

    <div class="video-wrapper">
      <div class="video-feed">
        <div ref="videoRef"></div>
        <canvas
            ref="canvasRef"
            class="absolute"
        >
        </canvas>
      </div>
    </div>
    <div class="sidebar">
      <div class="ptz-section">
        <div class="ptz-wrapper">
          <div class="ptz-ring"></div>
          <button
              class="ptz-btn ptz-up"
              @mousedown.prevent="() => press('Up')"
              @mouseup.prevent="() => release('Up')">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
            </svg>
          </button>
          <button
              class="ptz-btn ptz-down"
              @mousedown.prevent="() => press('Down')"
              @mouseup.prevent="() => release('Down')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"></path>
            </svg>
          </button>
          <button
              class="ptz-btn ptz-left"
              @mousedown.prevent="() => press('Left')"
              @mouseup.prevent="() => release('Left')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"></path>
            </svg>
          </button>
          <button
              class="ptz-btn ptz-right"
              @mousedown.prevent="() => press('Right')"
              @mouseup.prevent="() => release('Right')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"></path>
            </svg>
          </button>
          <button @click="() => requestCommand(CAMERA_COMMANDS.Calibration)" class="ptz-center">RESET</button>
        </div>

        <div class="slider-group">
          <div style="font-size:12px; color:var(--text-sub); width:60px; font-weight:600">Tốc độ</div>
          <span style="font-size:12px; color:var(--text-sub)">1</span>
          <input v-model="speed" type="range" min="1" max="5" class="custom-slider">
          <span style="font-size:12px; color:var(--text-sub)">5</span>
          <span
              style="font-size:13px; color:var(--primary); width:20px; text-align:right; font-weight:700">{{
              speed
            }}</span>
        </div>

        <div class="slider-group" style="margin-top:10px">
          <div style="font-size:12px; color:var(--text-sub); width:60px; font-weight:600">Zoom</div>
          <div style="display:flex; gap:10px; flex:1">
            <button class="v-btn" style="background:#334155; flex:1; height:40px" title="Phóng to"
                    @click="() => requestCommand(CAMERA_COMMANDS.ZoomIn)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="v-btn" style="background:#334155; flex:1; height:40px" title="Thu nhỏ"
                    @click="() => requestCommand(CAMERA_COMMANDS.ZoomOut)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
          </div>
        </div>
        <slot name="sidebar">
          <!-- Measure Temp Section -->
          <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border); width:100%">
            <div
                style="font-size:11px; font-weight:700; color:var(--text-sub); margin-bottom:12px; text-transform:uppercase;">
              ĐO NHIỆT ĐỘ
            </div>

            <!-- Start Button -->
            <div v-show="isDrawing===false">
              <button class="v-btn action-btn-primary" @click="startDrawing">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                  <line x1="3" y1="22" x2="21" y2="22"></line>
                </svg>
                Vẽ điểm/vùng
              </button>
            </div>
            <!-- Active Actions (Hidden by default) -->
            <div v-show="isDrawing===true" style="display: grid; gap: 12px; grid-template-columns: 1.5fr 1fr;">
              <el-button class="v-btn"
                         :loading="measureTempLoading"
                         @click="measureTemp"
                         style="background:#3B82F6; color:white; width:100%; height:44px; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:6px; font-weight:600; font-size:13px; border:none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                </svg>
                Đo nhiệt
              </el-button>
              <button class="v-btn" @click="stopDrawing"
                      style="background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.5); color:#EF4444; width:100%; height:44px; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:6px; font-weight:600; font-size:13px">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Thoát
              </button>
            </div>

            <!-- Measurement Results (Hidden by default) -->
            <div v-show="visibleMeasurement" style="margin-top:15px; animation: fadeIn 0.3s ease-in-out;">
              <div style="font-size:13px; color:var(--text-sub); margin-bottom:10px;">Kết quả đo:</div>
              <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                <!-- Max -->
                <div
                    style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:8px; padding:10px; text-align:center;">
                  <div style="font-size:11px; color:#EF4444; font-weight:600; margin-bottom:4px;">Max
                  </div>
                  <div style="font-family:'JetBrains Mono'; font-size:16px; font-weight:700; color:#EF4444;">
                    {{ measurementResult?.maxTemperature }}°C
                  </div>
                </div>
                <!-- Avg -->
                <div
                    style="background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.3); border-radius:8px; padding:10px; text-align:center;">
                  <div style="font-size:11px; color:#F59E0B; font-weight:600; margin-bottom:4px;">Avg
                  </div>
                  <div style="font-family:'JetBrains Mono'; font-size:16px; font-weight:700; color:#F59E0B;">
                    {{ measurementResult?.aveTemperature }}°C
                  </div>
                </div>
                <!-- Min -->
                <div
                    style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:10px; text-align:center;">
                  <div style="font-size:11px; color:#10B981; font-weight:600; margin-bottom:4px;">Min
                  </div>
                  <div style="font-family:'JetBrains Mono'; font-size:16px; font-weight:700; color:#10B981;">
                    {{ measurementResult?.minTemperature }}°C
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Toolbar -->
          <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border); width:100%">
            <div
                style="font-size:11px; font-weight:700; color:var(--text-sub); margin-bottom:12px; text-transform:uppercase;">
              ĐIỀU KHIỂN
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <button class="v-btn action-btn-danger" title="Nút nguồn"
                      @click="() => requestCommand(CAMERA_COMMANDS.Restart)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                  <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
                Nguồn
              </button>
              <button class="v-btn action-btn-secondary" title="Cài đặt camera">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                  </path>
                </svg>
                Cài đặt
              </button>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Action Buttons Modern Style */
.action-btn-primary,
.action-btn-danger,
.action-btn-secondary {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 8px;
  /* Slightly more rounded */
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

.action-btn-primary {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: var(--primary);
}

.action-btn-primary:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.action-btn-danger {
  background: var(--danger);
  color: white;
  border: 1px solid var(--danger);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);
}

.action-btn-danger:hover {
  background: #DC2626;
  /* Darker red */
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(239, 68, 68, 0.35);
}

.action-btn-secondary {
  background: #334155;
  border: 1px solid var(--border);
  color: white;
}

.action-btn-secondary:hover {
  background: #475569;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

:root {
  --bg-body: #0F172A;
  --bg-panel: #1E293B;
  --border: #334155;
  --text-main: #F8FAFC;
  --text-sub: #94A3B8;
  --primary: #3B82F6;
  --danger: #EF4444;
  --success: #10B981;
  --warning: #F59E0B;
}

* {
  box-sizing: border-box;
}

body {
  background-color: var(--bg-body);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  margin: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* HEADER */
.live-header {
  height: 50px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.cam-title {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.live-badge {
  background: var(--danger);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  animation: blink 2s infinite;
  display: flex;
  align-items: center;
  gap: 4px;
}

.live-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

@keyframes blink {
  50% {
    opacity: 0.7;
  }
}

/* MAIN LAYOUT */
.live-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  /* Video | Controls */
  flex: 1;
  height: unset;
}

/* --- VIDEO AREA --- */
.video-wrapper {
  position: relative;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-feed {
  position: relative;
  display: inline-block;
}

.video-feed video {
  display: block;
}

.video-feed canvas {
  position: absolute;
  top: 0;
  left: 0;
}

/* HUD Overlay (Lớp phủ thông tin) */
.hud-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Bounding Box thông minh */
.hud-box {
  position: absolute;
  border: 2px solid rgba(59, 130, 246, 0.6);
  background: rgba(59, 130, 246, 0.05);
  cursor: pointer;
  pointer-events: auto;
  transition: 0.2s;
}

.hud-box:hover {
  border-color: var(--warning);
  background: rgba(245, 158, 11, 0.1);
  z-index: 10;
}

/* Label chỉ hiện khi hover hoặc mode chi tiết */
.hud-label {
  position: absolute;
  bottom: 100%;
  left: -2px;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  font-size: 11px;
  white-space: nowrap;
  border-radius: 4px 4px 4px 0;
  font-family: 'JetBrains Mono';
  display: flex;
  gap: 8px;
  align-items: center;
  opacity: 0;
  transition: 0.2s;
  pointer-events: none;
}

.hud-box:hover .hud-label,
.hud-box.alert .hud-label {
  opacity: 1;
}

.hud-val {
  font-weight: 700;
  color: var(--success);
}

.hud-box.alert {
  border-color: var(--danger);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
  animation: pulseBorder 2s infinite;
}

.hud-box.alert .hud-val {
  color: var(--danger);
}

@keyframes pulseBorder {
  50% {
    border-color: rgba(239, 68, 68, 0.3);
  }
}

/* Video Controls (Bottom Bar floating) */
.video-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}

.v-btn {
  border: none;
  color: var(--text-main);
  cursor: pointer;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.v-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary);
}

.v-btn.active {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

/* --- SIDEBAR CONTROLS --- */
.sidebar {
  background: var(--bg-panel);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 2;
}

/* 1. PTZ Controller (Joystick Modern) */
.ptz-section {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
}

.ptz-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
}

.ptz-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid var(--border);
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.ptz-btn {
  position: absolute;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.ptz-btn:hover {
  color: var(--primary);
  transform: scale(1.1);
}

.ptz-up {
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-down {
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-left {
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-right {
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #334155;
  color: white;
  font-weight: 700;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.ptz-center:active {
  transform: translate(-50%, -50%) scale(0.95);
  background: var(--primary);
}

/* Zoom/Focus Bars */
.slider-group {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.slider-icon {
  color: var(--text-sub);
  width: 20px;
}

.slider-track {
  flex: 1;
  height: 4px;
  background: #334155;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.slider-fill {
  width: 40%;
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
}

.slider-thumb {
  position: absolute;
  left: 40%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

/* 2. Real-time Data List */
.list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 12px 15px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}

.data-list {
  overflow-y: auto;
  padding: 0;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: 0.2s;
}

.data-item:hover {
  background: rgba(255, 255, 255, 0.05);
  padding-left: 20px;
}

.data-item.active {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid var(--primary);
}

.item-name {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
}

.item-sub {
  font-size: 11px;
  color: var(--text-sub);
  margin-top: 2px;
}

.item-val {
  font-family: 'JetBrains Mono';
  font-weight: 700;
  font-size: 13px;
  color: var(--success);
}

.item-val.hot {
  color: var(--danger);
}

/* SVG */
svg {
  /* fill: currentColor; */
}

/* Custom Range Slider */
.custom-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: #334155;
  border-radius: 2px;
  outline: none;
  flex: 1;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  transition: 0.2s;
}

.custom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.custom-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: none;
}
</style>
