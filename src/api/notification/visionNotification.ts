import request from '@/plugins/axios'

export const getVisionNotificationApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({url: 'api/VisionNotifications/list', params: searchParams})
}

export const getVisionNotificationDetailApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({url: 'api/VisionNotifications', params: searchParams})
}