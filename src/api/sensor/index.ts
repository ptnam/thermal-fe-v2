import request from '@/plugins/axios'

export const getAllSensorsApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/Sensors/All', params: searchParams })
}

export const getSensorListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/Sensors/list', params: searchParams })
}

export const addSensorApi = (data: any): Promise<IResponse> => {
  return request.post({ url: 'api/Sensors', data })
}

export const editSensorApi = (id: number, data: any): Promise<IResponse> => {
  return request.put({ url: `api/Sensors/${id}`, data })
}

export const deleteSensorApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `api/Sensors/${id}` })
}

export const exportSensorsIECApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({
    url: '/api/Sensors/exportSensors',
    params: searchParams,
    responseType: 'blob'
  })
}

export const importSensorsIECApi = (data: any): Promise<IResponse> => {
  return request.post({
    url: '/api/Sensors/importIEC', data, headers: {'Content-Type': 'multipart/form-data'}
  })
}
