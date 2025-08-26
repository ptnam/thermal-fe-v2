import { i18n, setHtmlPageLang } from '@/plugins/vueI18n'
import { useLocaleStoreWithOut } from '@/store/modules/locale'

const localeStore = useLocaleStoreWithOut()
const setI18nLanguage = (locale: LocaleType) => {
  (i18n.global.locale as any).value = locale
  localeStore.setCurrentLocale({
    lang: locale
  })
  setHtmlPageLang(locale)
}

export const useLocale = () => {
  const changeLocale = async (locale: LocaleType) => {
    const globalI18n = i18n.global
    const langModule = await import(`../../locales/${locale}.ts`)
    globalI18n.setLocaleMessage(locale, langModule.default)

    setI18nLanguage(locale)
  }

  return {
    changeLocale
  }
}
