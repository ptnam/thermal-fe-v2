import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

type SubMenuType = {
  handleMouseleave: (e: Event) => void
}

export function useFixBug() {
  const storeApp = useAppStore()
  const device = computed(() => storeApp.device)

  const subMenu = ref<SubMenuType | null>(null)

  function fixBugIniOS() {
    if (subMenu.value) {
      const handleMouseleave = subMenu.value.handleMouseleave
      subMenu.value.handleMouseleave = (e) => {
        if (device.value === 'mobile') {
          return
        }
        handleMouseleave(e)
      }
    }
  }

  onMounted(() => {
    fixBugIniOS()
  })

  return {
    subMenu,
  }
}
