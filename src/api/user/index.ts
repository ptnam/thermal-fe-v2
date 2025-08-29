import request from '@/plugins/axios'
import { UserLoginType } from '@/api/login/types'

export const getUserListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/Users/list', params: searchParams })
}

export const addUserApi = (data: UserLoginType): Promise<IResponse> => {
  return request.post({ url: 'api/Users', data })
}

export const editUserApi = (id: number, data: UserLoginType): Promise<IResponse> => {
  return request.put({ url: `api/Users/${id}`, data })
}

export const deleteUserApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `api/Users/${id}`})
}

export const saveFirebaseTokenApi = (data: any): Promise<IResponse> => {
  return request.post({ url: '/api/Users/userToken', data })
}
export const syncTelegramChatIdApi = (): Promise<IResponse<[]>> => {
  return request.post({ url: '/api/Users/syncTelegramChatId' })
}