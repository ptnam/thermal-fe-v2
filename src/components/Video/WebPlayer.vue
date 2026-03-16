<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {getStreamApi} from '@/api/camera'
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  streamKey: {type: [String, Number], required: true},
  cam: {type: [Object], required: false},
})

const videoRef = ref<HTMLElement | null>(null)

const videoLoading = ref(true)
const videoStream = document.createElement('video-stream') as any
videoStream.addEventListener('stream-onopen', () => {
  videoLoading.value = false
})
videoStream.addEventListener('stream-error', () => {
  videoLoading.value = false
})
const isPlaying = ref(false)
const loading = ref(false)

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
      })
})
const emit = defineEmits(['fullscreen'])
const redirectFullScreen = () => {
  return router.push({name: 'live_detail', params: {id: props.streamKey}})
}

function screenshot() {
  videoStream.saveScreenshot()
}
</script>
<template>
  <div class="cam-cell">
    <div class="cam-header"><div style="display:flex; align-items:center; gap:8px">
      <div class="dot-live"></div>
      <span class="cam-name-tag">{{ cam?.name }}</span>
    </div>
      <span class="cam-time-tag"></span>
    </div>
    <div ref="videoRef" class="cam-img"></div>
    <div class="cam-footer">
      <button class="cam-action-btn" title="Thiết lập vùng AI">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L4 2l3.5 12.5L15 16l3-3z"></path>
        </svg>
      </button>
      <button class="cam-action-btn" title="Thêm điểm đo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </button>
      <button class="cam-action-btn" title="Chụp ảnh" @click="screenshot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </button>
      <button class="cam-action-btn" title="Ghi hình">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <rect x="9" y="9" width="6" height="6"></rect>
        </svg>
      </button>
      <button class="cam-action-btn" title="Tuần tra/Preset">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
          <polyline points="21 3 21 8 16 8"></polyline>
        </svg>
      </button>
      <button class="cam-action-btn" title="Tắt cảnh báo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
      </button>
      <button class="cam-action-btn" title="Toàn màn hình" @click="redirectFullScreen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </button>
    </div>
  </div>
</template>