<script lang="ts" setup>
import {computed, onBeforeMount, ref} from 'vue'
import {Navbar, Sidebar, AppMain} from './components'
import {useResizeHandler} from './mixin/ResizeHandler'
import {useAppStore} from '@/store/modules/app'
import {useConfigStore} from '@/store/modules/configStore'
import {usePaginationStore} from '@/store/modules/paginationStore'
import {setupFcmListener} from "@/plugins/firebase/firebase";


try {
  setupFcmListener()
} catch (e) {

}
useResizeHandler()
const appStore = useAppStore()
const configStore = useConfigStore()
const paginationStore = usePaginationStore()

const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)
const fixedHeader = computed(() => appStore.fixedHeader)
// const pageLoading = computed(() => appStore.pageLoading)

const classObj = computed(() => {
  return {
    hideSidebar: !sidebar.value.opened,
    openSidebar: sidebar.value.opened,
    withoutAnimation: sidebar.value.withoutAnimation,
    // mobile: device.value === 'mobile',
  }
})
const loadConfigLoading = ref(true)
onBeforeMount(async () => {
  try {
    await configStore.loadConfig()
    await paginationStore.loadConfig()
  } catch (e) {
  } finally {
    loadConfigLoading.value = false
  }
})
const handleClickOutside = () => {
  appStore.closeSideBar(false)
}
</script>
<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <Sidebar class="sidebar-container"/>
    <div class="main-container" v-loading="loadConfigLoading">
      <div :class="{ 'fixed-header': fixedHeader }">
        <Navbar/>
      </div>
      <AppMain v-if="!loadConfigLoading"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixin' as *;
@use '@/assets/styles/variables' as *;

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
</style>
