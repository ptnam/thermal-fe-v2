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
import {useLang} from '@/hooks/web/useI18n'
import Navbar from "@/layout/components/ThemeV2/Navbar.vue";

try {
  setupFcmListener()
  requestAndSendFcmToken()
} catch{}
useResizeHandler()
const configStore = useConfigStore()
const paginationStore = usePaginationStore()

const {noticeModal} = useNoticeModal()
const {t} = useLang()
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
    noticeModal(t('layout.soundPermission'), enableNotificationSound)
  }
}
</script>
<template>
  <div class="app-layout">
    <Navbar></Navbar>
    <el-skeleton v-if="loadConfigLoading" :rows="5" animated />
    <AppMain v-else />
  </div>
</template>

<style lang="scss">
@use "@/assets/styles/style.scss";
@use "@/assets/styles/responsive-fixes.scss";
</style>