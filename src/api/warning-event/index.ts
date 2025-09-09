import request from '@/plugins/axios'

export const getAllWarningEventApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/WarningEvents/All', params: searchParams })
}
export const getWarningEventListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/WarningEvents/list', params: searchParams })
}

export const addWarningEventApi = (data: object): Promise<IResponse> => {
  return request.post({ url: 'api/WarningEvents', data })
}

export const editWarningEventApi = (id: number, data: object): Promise<IResponse> => {
  return request.put({ url: `api/WarningEvents/${id}`, data })
}

export const deleteWarningEventApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `api/WarningEvents/${id}` })
}
