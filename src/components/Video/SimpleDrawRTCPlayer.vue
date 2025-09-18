<template>
  <div class="rounded overflow-hidden shadow-lg bg-white p-2">
    <div
        v-loading="loading"
        class="relative aspect-video border rounded bg-black overflow-hidden group"
    >
      <div
          ref="videoRef"
          :class="['h-[-webkit-fill-available] relative', isFullscreen? 'flex justify-center items-center': '']"
      >
        <div
            v-if="isFullscreen"
            class="flex gap-2 absolute bottom-2 left-2 z-20 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <el-button
              v-if="isDrawing === false"
              size="small"
              circle
              type="warning"
              :icon="Aim"
              @click="startDrawing"
          >
          </el-button>
          <el-button
              v-if="isDrawing && (pointCount === 1 || pointCount >= 3)"
              size="small"
              type="danger"
              circle
              :icon="Odometer"
              :loading="measureTempLoading"
              @click="measureTemp"
          >
          </el-button>
          <el-button
              v-if="isDrawing && pointCount"
              color="#495480"
              size="small"
              circle
              :icon="CloseBold"
              @click="drawer?.removeAllPoint()"
          >
          </el-button>
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
  Aim,
  Odometer,
  CloseBold,
} from '@element-plus/icons-vue'
import {getStreamApi} from '@/api/camera'
import {PolygonDrawer} from '@/utils/PolygonDrawer'
import useRequest from '@/hooks/web/useRequest'
import {thermalDataByAreaApi} from '@/api/thermal-data'

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

function togglePlayback() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

function play() {
  videoStream.play()
}

function pause() {
  videoStream.pause()
}

function screenshot() {
  videoStream.saveScreenshot()
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
                  drawer?.showFullScreenAlert(videoRef, 'không phải hình đa giác lồi, vui lòng vẽ lại!')
                }
              })
            },
        )
      }

      drawer.removeAllPoint() // always start fresh
      drawer.start()
    }
  })
}

const {onRequest: measureTempRequest, isLoading: measureTempLoading} = useRequest()

function measureTemp() {
  const video = videoRef.value?.querySelector('video') as HTMLVideoElement
  const rect = video.getBoundingClientRect()

  interface Point {
    x: number
    y: number
  }

  const tmpPoints: Point[] = []

  for (const item of pointValues.value as Point[]) {
    const x = (item.x / rect.width) * 100
    const y = (item.y / rect.height) * 100
    tmpPoints.push({x, y})
  }
  measureTempRequest(thermalDataByAreaApi, {
    videoWidth: videoWidth.value,
    videoHeight: videoHeight.value,
    cameraId: props.streamKey,
    points: tmpPoints,
  })
      .then((res) => {
        if (res.data) {
          drawer?.showFullScreenAlert(
              videoRef,
              `
            Min: ${res.data.minTemperature},
            Max: ${res.data.maxTemperature},
            Trung bình: ${res.data.aveTemperature}
          `,
          )
        }
      })
      .catch((e) => {
        drawer?.showFullScreenAlert(videoRef, e.toString())
      })
}
</script>

