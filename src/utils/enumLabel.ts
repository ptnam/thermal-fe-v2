import { DEFAULT_LOCALE, i18n } from '@/plugins/vueI18n'

// Dịch nhãn enum backend theo mã; tiếng Việt giữ chữ backend, mã chưa có bản dịch thì hiện chữ backend
export const enumLabel = (group: string, code?: unknown, fallback?: unknown): string => {
  const { t, te, locale } = i18n.global
  const text = fallback == null ? '' : String(fallback)
  if (locale.value === DEFAULT_LOCALE && text) return text
  const key = `enums.${group}.${code}`
  return code != null && te(key) ? t(key) : text || String(code ?? '')
}
