import request from '@/plugins/axios'

export const getAllNotificationChannelApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/NotificationChannels/All', params: searchParams })
}
export const getNotificationChannelListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/NotificationChannels/list', params: searchParams })
}

export const addNotificationChannelApi = (data: any): Promise<IResponse> => {
  return request.post({ url: 'api/NotificationChannels', data })
}

export const editNotificationChannelApi = (id: number, data: any): Promise<IResponse> => {
  return request.put({ url: `api/NotificationChannels/${id}`, data })
}

export const deleteNotificationChannelApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `api/NotificationChannels/${id}` })
}
