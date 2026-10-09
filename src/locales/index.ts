// Mỗi file trong locales/<lang>/ là một namespace: tên file = key gốc (vd. vi/router.ts -> t('router.xxx'))
const modules = import.meta.glob<{ default: Record<string, unknown> }>('./*/*.ts')

export const loadLocaleMessages = async (lang: LocaleType) => {
  const entries = Object.entries(modules).filter(([path]) => path.startsWith(`./${lang}/`))
  const namespaces = await Promise.all(
    entries.map(async ([path, load]) => {
      const name = path.slice(path.lastIndexOf('/') + 1, -'.ts'.length)
      return [name, (await load()).default] as const
    }),
  )
  return Object.fromEntries(namespaces)
}
