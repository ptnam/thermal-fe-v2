import request from '@/plugins/axios'

export const getAllNotificationGroupApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/NotificationGroups/All', params: searchParams })
}
export const getNotificationGroupListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/NotificationGroups/list', params: searchParams })
}

export const addNotificationGroupApi = (data: any): Promise<IResponse> => {
  return request.post({ url: 'api/NotificationGroups', data })
}

export const editNotificationGroupApi = (id: number, data: any): Promise<IResponse> => {
  return request.put({ url: `api/NotificationGroups/${id}`, data })
}

export const deleteNotificationGroupApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `api/NotificationGroups/${id}` })
}
