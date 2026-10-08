import { i18n, syncLocale } from '@/plugins/vueI18n'
import { loadLocaleMessages } from '@/locales'

export const useLocale = () => {
  const changeLocale = async (lang: LocaleType) => {
    const global = i18n.global
    if (!global.availableLocales.includes(lang)) {
      global.setLocaleMessage(lang, await loadLocaleMessages(lang))
    }
    global.locale.value = lang
    syncLocale(lang)
  }

  return {
    changeLocale,
  }
}
