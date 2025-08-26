<template>
  <div v-if="!item.hidden && hasPermission(item.meta?.permission || [])">
    <template
      v-if="
        hasOneShowingChild(item, item.children) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <SvgIcon :name="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" />
          <template #title>
            {{ routerTitle(onlyOneChild) }}
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)" popper-append-to-body>
      <template #title>
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="routerTitle(item)" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script>
import { isExternal } from '@/utils/validate.ts'
import Item from './base-item.vue'
import AppLink from './sidebar-link.vue'
import { useFixBug } from './FixiOSBug'
import { ref } from 'vue'
import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'
import { routerTitle } from '@/hooks/web/useTitle.js'
import { usePermission } from '@/hooks/web/usePermission.js'

export default {
  name: 'SidebarItem',
  methods: { routerTitle },
  components: { SvgIcon, Item, AppLink },
  props: {
    item: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const onlyOneChild = ref(null)

    const subMenu = useFixBug()
    const { hasPermission } = usePermission()
    const hasOneShowingChild = (parent, children = []) => {
      const showingChildren = children.filter((item) => {
        const perm = item.meta?.permission || []
        if (item.hidden || !hasPermission(perm)) {
          return false
        } else {
          onlyOneChild.value = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    }

    const resolvePath = (routePath) => {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(props.basePath)) {
        return props.basePath
      }
      routePath = routePath ? '/' + routePath : ''
      return props.basePath ? `${props.basePath}${routePath}` : routePath
    }

    return {
      subMenu,
      onlyOneChild,
      hasOneShowingChild,
      resolvePath,
      hasPermission,
    }
  },
}
</script>
<style lang="scss" scoped>
.el-menu {
  .el-icon {
    flex-shrink: unset;
  }
}
</style>
