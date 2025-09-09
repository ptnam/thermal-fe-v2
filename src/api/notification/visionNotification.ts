import request from '@/plugins/axios'

export const getVisionNotificationApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({url: 'api/VisionNotifications/list', params: searchParams})
}