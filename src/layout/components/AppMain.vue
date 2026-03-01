<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
export default {
  name: 'AppMain',
  setup() {
    const route = useRoute()

    const key = computed(() => route.path)

    return {
      key,
    }
  },
}
</script>

<style scoped>
.fixed-header + .app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
