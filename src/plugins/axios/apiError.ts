import type { AxiosError } from 'axios'
import { i18n } from '@/plugins/vueI18n'

interface ApiErrorBody {
  message?: unknown
  errorCode?: string
}

// Câu lỗi backend -> key i18n; named group trong regex được truyền làm tham số.
// Vd: { pattern: /^Camera (?<name>.+) đã tồn tại$/, key: 'apiError.messages.cameraExists' }
const API_ERROR_PATTERNS: { pattern: RegExp; key: string }[] = []

const VIETNAMESE_CHARS = /[ăâđêôơưàáạảãấầẩẫậắằẳẵặèéẹẻẽếềểễệìíịỉĩòóọỏõốồổỗộớờởỡợùúụủũứừửữựỳýỵỷỹ]/i

const STATUS_KEYS: Record<number, string> = {
  400: 'badRequest',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'notFound',
  409: 'conflict',
  413: 'payloadTooLarge',
  502: 'unavailable',
  503: 'unavailable',
  504: 'timeout',
}

const fallbackKey = (error: AxiosError) => {
  if (error.code === 'ERR_CANCELED') return 'canceled'
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'timeout'
  const status = error.response?.status
  if (!status) return error.code === 'ERR_NETWORK' ? 'network' : 'unknown'
  return STATUS_KEYS[status] ?? (status >= 500 ? 'server' : 'unknown')
}

// Thứ tự: errorCode -> mẫu câu đã biết -> câu gốc nếu đọc được -> câu chung theo status
export const translateApiError = (error: AxiosError): string => {
  const { t, te, locale } = i18n.global
  const body = error.response?.data as ApiErrorBody | undefined
  const raw = typeof body?.message === 'string' ? body.message.trim().normalize('NFC') : ''

  if (body?.errorCode && te(`apiError.codes.${body.errorCode}`)) {
    return t(`apiError.codes.${body.errorCode}`)
  }
  if (raw) {
    for (const { pattern, key } of API_ERROR_PATTERNS) {
      const match = raw.match(pattern)
      if (match) return t(key, match.groups ?? {})
    }
    if (locale.value === 'vi' || !VIETNAMESE_CHARS.test(raw)) return raw
    if (import.meta.env.DEV) console.warn('[i18n] Câu lỗi backend chưa có bản dịch:', raw)
  }
  return t(`apiError.${fallbackKey(error)}`)
}
