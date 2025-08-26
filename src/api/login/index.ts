import request from '@/plugins/axios'
import { UserLoginResult, UserLoginType } from './types'

export const loginApi = (data: UserLoginType): Promise<IResponse<UserLoginResult>> => {
  return request.post({ url: 'api/Auth/login', data })
}

export const refreshTokenApi = (data: object): Promise<IResponse<UserLoginResult>> => {
  return request.post({
    url: 'api/Auth/refresh',
    data: data,
  })
}

export const myProfileApi = (): Promise<object> => {
  return request.get({
    url: 'api/Auth/myProfile',
  })
}

export const logoutApi = (): Promise<IResponse> => {
  return request.post({ url: 'api/auth/logout' })
}
