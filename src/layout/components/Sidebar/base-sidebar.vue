<script setup>
import { useAppStore } from '@/store/modules/app'
import Logo from './sidebar-logo.vue'
import SidebarItem from './sidebar-item.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const store = useAppStore()
const router = useRouter();

const sidebar = computed(() => store.sidebar)
const routes = computed(() => router.options.routes)

const activeMenu = computed(() => {
  const { meta, path } = router
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
const isCollapse = computed(() => !sidebar.value.opened)
</script>

<template>
  <div class="has-logo">
    <Logo :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#FFF"
        :unique-opened="false"
        active-text-color="#409EFF"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="item in routes"
          :key="item.path"
          :item="item"
          :base-path="item.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

