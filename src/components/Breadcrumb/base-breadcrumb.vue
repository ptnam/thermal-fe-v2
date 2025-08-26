<script setup lang="ts">
import { compile } from 'path-to-regexp'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { routerTitle } from '@/hooks/web/useTitle'

const router = useRouter()
const route = useRoute()

const getBreadcrumb = () => {
  // only show routes with meta.title
  let matched = route.matched.filter((item) => item.name)

  return matched.filter((item) => item.name && item.meta.breadcrumb !== false)
}
const pathCompile = (path: string) => {
  // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
  const { params } = route
  let toPath = compile(path)
  return toPath(params)
}
const handleLink = (item: any) => {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push(pathCompile(path))
}

// computed
const levelList = computed(() => getBreadcrumb())
</script>
<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="item.redirect === 'noRedirect' || index === levelList.length - 1"
          class="no-redirect"
          >{{ routerTitle(item) }}</span
        >
        <a v-else @click.prevent="handleLink(item)">{{ routerTitle(item) }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
