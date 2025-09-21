<template>
  <div class="rounded overflow-hidden shadow-lg bg-white px-2">
    <div
        v-loading="loading"
        class="relative aspect-video border rounded bg-black overflow-hidden group"
    >
      <div
          ref="videoRef"
          :class="[
          'h-[-webkit-fill-available] relative',
          isFullscreen ? 'flex justify-center items-center' : '',
        ]"
      >
        <!-- Controls -->
        <div
            class="absolute bottom-2 right-2 z-20 px-3 py-2 rounded-lg flex gap-2 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <el-button size="default" circle type="info" @click="toggleFullScreen" :icon="FullScreen"/>
        </div>
        <div
            v-if="isFullscreen"
            class="flex gap-2 absolute bottom-2 left-2 z-20 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <el-button
              v-if="isDrawing === false"
              size="default"
              circle
              type="warning"
              :icon="Aim"
              @click="startDrawing"
          >
          </el-button>
          <el-button
              v-if="isDrawing && pointCount"
              color="#495480"
              size="default"
              circle
              :icon="CloseBold"
              @click="drawer?.removeAllPoint()"
          >
          </el-button>
          <el-tooltip content="Lưu tọa độ vùng">
            <el-button
                v-if="isDrawing && pointCount"
                color="#16457F"
                size="default"
                circle
                :icon="SetUp"
                :loading="savePresetLoading"
                @click="saveVisionPresets"
            >
            </el-button>
          </el-tooltip>
        </div>
        <!-- Canvas overlay -->
        <canvas
            ref="canvasRef"
            class="absolute z-1 pointer-events-auto"
            v-show="isDrawing"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import {
  CloseBold,
  SetUp,
  FullScreen, Aim,
} from '@element-plus/icons-vue'
import {getStreamApi, visionPresetApi} from '@/api/camera'
import {PolygonDrawer} from '@/utils/PolygonDrawer'
import {ElMessage} from "element-plus";

const props = defineProps({
  streamKey: {type: [String, Number], required: true},
  cam: {type: [Object], required: false},
})

const videoRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const videoLoading = ref(true)
const videoStream = document.createElement('video-stream') as any
videoStream.addEventListener('stream-onopen', () => {
  videoLoading.value = false
  nextTick(() => {
    pictureScreenMode()
  })
})
videoStream.addEventListener('stream-error', () => {
  videoLoading.value = false
})
const isPlaying = ref(false)
const loading = ref(false)
const isDrawing = ref(false)
const isFullscreen = ref(false)
const pointCount = ref(0)

let drawer: PolygonDrawer | null = null

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

        document.addEventListener('fullscreenchange', () => {
          isFullscreen.value = !!document.fullscreenElement
          const videoEl = videoRef.value?.querySelector('video')
          if (videoEl) {
            if (isFullscreen.value) {
              fullScreenMode()
            } else {
              pictureScreenMode()
              isDrawing.value = false
              drawer?.stop()
            }
            drawer?.removeAllPoint()
          }
        })
      })
      .finally(() => {
        loading.value = false
      })
  pictureScreenMode()
})

const pictureScreenMode = () => {
  const videoEl = videoRef.value?.querySelector('video')
  if (videoEl) {
    videoEl.style.objectFit = 'fill'
    videoEl.style.width = '100%'
    videoEl.style.height = '100%'
  }
}

const fullScreenMode = () => {
  const videoEl = videoRef.value?.querySelector('video')
  if (videoEl) {
    videoEl.style.objectFit = 'contain'
    videoEl.style.width = 'unset'
    videoEl.style.height = 'unset'
  }
}

function toggleFullScreen() {
  const video = videoRef.value
  const doc = document as any
  if (!document.fullscreenElement) video?.requestFullscreen?.()
  else doc.exitFullscreen?.()
}

const pointValues = ref<any>([])
const videoWidth = ref(0)
const videoHeight = ref(0)

function startDrawing() {
  isDrawing.value = true
  nextTick(() => {
    const c = canvasRef.value
    const v = videoRef.value?.querySelector('video') as HTMLVideoElement
    if (c && v) {
      c.width = v.videoWidth
      c.height = v.videoHeight

      videoWidth.value = v.clientWidth
      videoHeight.value = v.clientHeight

      if (!drawer) {
        drawer = new PolygonDrawer(
            c,
            (_points) => {
              isDrawing.value = false
            },
            (points) => {
              pointCount.value = points.length
              pointValues.value = points
              nextTick(() => {
                if (pointCount.value >= 3 && !drawer?.isConvex()) {
                  drawer?.showFullScreenAlert(
                      videoRef,
                      'không phải hình đa giác lồi, vui lòng vẽ lại!',
                  )
                }
              })
            },
            'red',
            'blue'
        )
      }

      drawer.removeAllPoint()
      drawer.start()
    }
  })
}

const presetData = ref({})
const setPresetData = (data: any) => {
  presetData.value = data
}

const getImageData = (): string | null => {
  const c = canvasRef.value;
  // @ts-ignore
  const v = videoRef.value?.lastChild?.video as HTMLVideoElement;

  if (!c || !v) {
    console.warn("Canvas or video not ready");
    return null;
  }

  // Ensure metadata is available
  const width = v.videoWidth || c.width || c.offsetWidth;
  const height = v.videoHeight || c.height || c.offsetHeight;

  if (width === 0 || height === 0) {
    console.warn("Video not ready or canvas has no size yet");
    return null;
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width
  tempCanvas.height = height;

  const ctx = tempCanvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(v as HTMLVideoElement, 0, 0, width, height);
  ctx.drawImage(c as HTMLCanvasElement, 0, 0, width, height);

  return tempCanvas.toDataURL("image/png");
};

const savePresetLoading = ref(false)

const emits = defineEmits(['saved'])
const saveVisionPresets = () => {
  savePresetLoading.value = true
  visionPresetApi({
    ...presetData.value,
    ...{
      areaPoints: pointValues.value,
      imageData: getImageData()
    }
  }).then(_ => {
    emits('saved')
    toggleFullScreen()
    nextTick(() => {
      ElMessage({
        message: 'Lưu thành công!',
        type: 'success',
      })
    })
  }).finally(() => {
    savePresetLoading.value = false
  })
}

defineExpose({
  toggleFullScreen,
  startDrawing,
  setPresetData
})
</script>
