import { isArray } from '@/utils/is'

export const joinFieldValues = (data: any[], field: string, separator: string = ', '): string => {
  return isArray(data) ? data.map((item) => item[field]).join(separator) : ''
}
