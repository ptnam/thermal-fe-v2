import { onMounted, computed, onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useRoute } from 'vue-router'

const { body } = document
const WIDTH = 992 // refer to Bootstrap's responsive design

export function useResizeHandler() {
  const store = useAppStore()
  const route = useRoute()

  const sidebar = computed(() => store.sidebar)
  const device = computed(() => store.device)

  // use $_ for mixins properties
  // https://vuejs.org/v2/style-guide/index.html#Private-property-names-essential
  function $_isMobile() {
    const rect = body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  function $_resizeHandler() {
    if (!document.hidden) {
      const isMobile = $_isMobile()
      store.toggleDevice(isMobile ? 'mobile' : 'desktop')

      if (isMobile) {
        store.closeSideBar(true);
      }
    }
  }

  onMounted(() => {
    const isMobile = $_isMobile()
    if (isMobile) {
      store.toggleDevice('mobile')
      store.closeSideBar(true);
    }
  })

  onBeforeMount(() => {
    window.addEventListener('resize', $_resizeHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', $_resizeHandler)
  })

  watch(
    () => route.path,
    () => {
      if (device.value === 'mobile' && sidebar.value.opened) {
        store.closeSideBar(false);
      }
    },
  )
}
