<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useLocaleStore } from '@/store/modules/locale'
import { useUserStore } from '@/store/modules/user'
import { useTitle } from '@/hooks/web/useTitle'
import {computed, onBeforeMount, onMounted, watch} from 'vue'
import "@/plugins/webRTC/video-stream.js";

const config = {
  autoInsertSpace: true,
}
const appStore = useAppStore();
const localeStore = useLocaleStore()
const userStore = useUserStore()
const currentLocale = computed(() => localeStore.getCurrentLocale)
const route = useRoute()

watch(() => currentLocale.value.lang, () => useTitle(route))

onBeforeMount(() => {
  appStore.initApp();
});

onMounted(() => {
  if (userStore.isAuthenticated) {
    userStore.loadCurrentUser()
  }
})

</script>

<template>
  <el-config-provider :locale="currentLocale.elLocale" :button="config" size="default">
    <RouterView />
  </el-config-provider>
</template>
