<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { AppMain } from './components'
import { useResizeHandler } from './mixin/ResizeHandler'
import { useConfigStore } from '@/store/modules/configStore'
import { usePaginationStore } from '@/store/modules/paginationStore'
import {
  enableNotificationSound,
  isNotificationGranted,
  requestAndSendFcmToken,
  setupFcmListener,
} from '@/plugins/firebase/firebase'
import {useNoticeModal} from '@/hooks/web/useModal'
import Navbar from "@/layout/components/ThemeV2/Navbar.vue";

try {
  setupFcmListener()
  requestAndSendFcmToken()
} catch{}
useResizeHandler()
const configStore = useConfigStore()
const paginationStore = usePaginationStore()

const {noticeModal} = useNoticeModal()
const loadConfigLoading = ref(true)
onBeforeMount(async () => {
  try {
    await configStore.loadConfig()
    await paginationStore.loadConfig()
    checkSound()
  } catch (e) {
  } finally {
    loadConfigLoading.value = false
  }
})

const checkSound = () => {
  if (!isNotificationGranted()) {
    noticeModal('Hãy cho phép thiết bị bật âm thanh', enableNotificationSound)
  }
}
</script>
<template>
  <div class="app-layout">
    <Navbar></Navbar>
    <AppMain v-if="!loadConfigLoading" />
  </div>
</template>

<style lang="scss">
@import "@/assets/styles/style.scss";
@import "@/assets/styles/responsive-fixes.scss";
</style>