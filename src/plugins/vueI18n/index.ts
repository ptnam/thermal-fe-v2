import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
import type { I18n } from 'vue-i18n'
import { useLocaleStoreWithOut } from '@/store/modules/locale'
import { loadLocaleMessages } from '@/locales'
import { applyLibraryLocale } from './libraryLocale'

export const DEFAULT_LOCALE: LocaleType = 'vi'

export let i18n: I18n<{}, {}, {}, string, false>

export const setHtmlPageLang = (locale: LocaleType) => {
  document.querySelector('html')?.setAttribute('lang', locale)
}

// Đồng bộ store, thẻ html và thư viện ngoài sau khi đổi ngôn ngữ
export const syncLocale = (lang: LocaleType) => {
  useLocaleStoreWithOut().setCurrentLocale({ lang })
  setHtmlPageLang(lang)
  applyLibraryLocale(lang)
}

export const setupI18n = async (app: App<Element>) => {
  const lang = useLocaleStoreWithOut().getCurrentLocale.lang
  // Luôn nạp vi để key thiếu ở ngôn ngữ khác rơi về tiếng Việt thay vì hiện tên key
  const langs = [...new Set<LocaleType>([DEFAULT_LOCALE, lang])]
  const messages = Object.fromEntries(
    await Promise.all(langs.map(async (l) => [l, await loadLocaleMessages(l)] as const)),
  )

  i18n = createI18n({
    legacy: false,
    locale: lang,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
    missingWarn: import.meta.env.DEV,
    fallbackWarn: false,
  })
  app.use(i18n)
  syncLocale(lang)
}
