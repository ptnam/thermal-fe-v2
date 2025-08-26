import request from '@/plugins/axios'

export const getAllSensorTypeApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/SensorTypes/All', params: searchParams })
}

export const getSensorTypeListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/SensorTypes/list', params: searchParams })
}

export const addSensorTypeApi = (data: any): Promise<IResponse> => {
  return request.post({ url: 'api/SensorTypes', data })
}

export const editSensorTypeApi = (id: number, data: any): Promise<IResponse> => {
  return request.put({ url: `api/SensorTypes/${id}`, data })
}

export const deleteSensorTypeApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `api/SensorTypes/${id}` })
}
