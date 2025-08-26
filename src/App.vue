<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useLocaleStore } from '@/store/modules/locale'
import { useUserStore } from '@/store/modules/user'
import { computed, onMounted } from 'vue'
import "@/plugins/webRTC/video-stream.js";

const config = {
  autoInsertSpace: true,
}
const localeStore = useLocaleStore()
const userStore = useUserStore()
const currentLocale = computed(() => localeStore.getCurrentLocale)


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
