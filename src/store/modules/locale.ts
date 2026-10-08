import { defineStore } from 'pinia'
import { store } from '@/store'
import vi from 'element-plus/es/locale/lang/vi'
import en from 'element-plus/es/locale/lang/en'
import { useStorage } from '@/hooks/web/useStorage'

const { getStorage, setStorage } = useStorage('localStorage')

const elLocaleMap: Record<string, any> = {
  vi: vi,
  en: en,
}

export interface Language {
  el: Recordable
  name: string
}

interface LocaleDropdownType {
  lang: LocaleType
  name?: string
  elLocale?: Language
}

interface LocaleState {
  currentLocale: LocaleDropdownType
  localeMap: LocaleDropdownType[]
}

// Tên ngôn ngữ ghi bằng chính ngôn ngữ đó, không dịch
const LOCALE_MAP: LocaleDropdownType[] = [
  { lang: 'vi', name: 'Tiếng Việt' },
  { lang: 'en', name: 'English' },
]

const resolveLang = (lang: unknown): LocaleType =>
  LOCALE_MAP.find((item) => item.lang === lang)?.lang ?? 'vi'

export const useLocaleStore = defineStore('locales', {
  state: (): LocaleState => {
    return {
      currentLocale: {
        lang: resolveLang(getStorage('lang')),
      },
      localeMap: LOCALE_MAP,
    }
  },
  getters: {
    getCurrentLocale(): LocaleDropdownType {
      return this.currentLocale
    },
    getLocaleMap(): LocaleDropdownType[] {
      return this.localeMap
    },
  },
  actions: {
    setCurrentLocale(localeMap: LocaleDropdownType) {
      this.currentLocale.lang = localeMap?.lang
      this.currentLocale.elLocale = elLocaleMap[localeMap?.lang]
      setStorage('lang', localeMap?.lang)
    },
  },
})

export const useLocaleStoreWithOut = () => {
  return useLocaleStore(store)
}
