<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useLocaleStore } from '@/store/modules/locale'
import { useUserStore } from '@/store/modules/user'
import {computed, onBeforeMount, onMounted} from 'vue'
import "@/plugins/webRTC/video-stream.js";

const config = {
  autoInsertSpace: true,
}
const appStore = useAppStore();
const localeStore = useLocaleStore()
const userStore = useUserStore()
const currentLocale = computed(() => localeStore.getCurrentLocale)

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
