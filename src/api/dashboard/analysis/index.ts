import request from '@/plugins/axios'
import type {
  AnalysisTotalTypes,
  UserAccessSource,
  WeeklyUserActivity,
  MonthlySales
} from './types'

export const getCountApi = (): Promise<IResponse<AnalysisTotalTypes[]>> => {
  return request.get({ url: '/mock/analysis/total' })
}

export const getUserAccessSourceApi = (): Promise<IResponse<UserAccessSource[]>> => {
  return request.get({ url: '/mock/analysis/userAccessSource' })
}

export const getWeeklyUserActivityApi = (): Promise<IResponse<WeeklyUserActivity[]>> => {
  return request.get({ url: '/mock/analysis/weeklyUserActivity' })
}

export const getMonthlySalesApi = (): Promise<IResponse<MonthlySales[]>> => {
  return request.get({ url: 'https://hn.algolia.com/api/v1/search_by_date?tags=story' })
}
