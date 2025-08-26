import { defineStore } from 'pinia'
import { store } from '@/store'

interface AppState {
  title: string
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  device: 'desktop' | 'mobile' | string
  fixedHeader?: boolean
  pageLoading?: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => {
    return {
      title: import.meta.env.VITE_APP_TITLE,
      sidebar: {
        opened: true,
        withoutAnimation: false,
      },
      device: 'desktop',
      fixedHeader: false,
      pageLoading: false,
    }
  },
  getters: {
    getPageLoading(): boolean {
      return <boolean>this.pageLoading
    },
    getTitle(): string {
      return this.title
    },
  },
  actions: {
    toggleSideBar() {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
    },
    closeSideBar(withoutAnimation: boolean) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device: string) {
      this.device = device
    },
    setPageLoading(pageLoading: boolean) {
      this.pageLoading = pageLoading
    },
  },
  persist: true,
})

export const useAppStoreWithOut = () => {
  return useAppStore(store)
}
