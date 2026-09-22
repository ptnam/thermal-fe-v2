import { RawAxiosRequestHeaders } from 'axios'
declare global {
  declare interface Fn<T = never> {
    (...arg: T[]): T
  }

  declare type Nullable<T> = T | null

  declare type Recordable<T = never, K = string> = Record<K extends null | undefined ? string : K, T>

  declare type GenericObject = {
    [key: string]: any;
  }


  declare type ComponentRef<T> = InstanceType<T>

  declare type LocaleType = 'vi' | 'en'

  declare type AxiosContentType =
    | 'application/json'
    | 'application/x-www-form-urlencoded'
    | 'multipart/form-data'
    | 'text/plain'

  declare type AxiosMethod = 'get' | 'post' | 'delete' | 'put' | 'patch'

  declare type AxiosResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'

  declare interface AxiosConfig {
    params?: any
    data?: any
    url?: string
    method?: AxiosMethod
    headers?: RawAxiosRequestHeaders
    responseType?: AxiosResponseType
    paramsSerializer?: (params: any) => string
  }

  declare interface IResponse<T = never> {
    code: number
    data: T
  }
}
