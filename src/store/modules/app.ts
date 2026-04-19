import {defineStore} from 'pinia'
import {store} from '@/store'

interface AppState {
  title: string,
  theme: string,
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  device: string
  fixedHeader?: boolean
  pageLoading?: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => {
    return {
      title: import.meta.env.VITE_APP_TITLE,
      theme: "dark",
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
    isDark: (s) => s.theme === "dark",
    isMobile: (s) => s.device === 'mobile',
    getPageLoading(): boolean {
      return <boolean>this.pageLoading
    },
    getTitle(): string {
      return this.title
    },
  },
  actions: {
    initApp() {
      this.initTheme();
    },
    applyThemeToDOM(isDark: boolean) {
      const html = document.documentElement;
      const theme = isDark ? 'dark': 'light'
      html.dataset.theme =theme;
      html.className = theme
    },
    setDark(v: boolean) {
      this.theme = v ? "dark" : "light";
      this.applyThemeToDOM(v);
    },
    initTheme() {
      this.applyThemeToDOM(this.theme === "dark");
    },
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
