import request from '@/plugins/axios'

function serializeFlatParams(params: Record<string, any>): string {
  const usp = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, String(v)))
    } else {
      usp.append(key, String(value))
    }
  })
  return usp.toString()
}

export const getAllMachineApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({url: '/api/Machines/All', params: searchParams})
}

// machinesByAreas (POST, cần Producer Token) chỉ dùng nội bộ giữa services - allByAreas mới là API cho FE.
export const getMachinesByAreasApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({url: '/api/machines/allByAreas', params: searchParams, paramsSerializer: serializeFlatParams})
}
export const getMachineListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({url: '/api/Machines/list', params: searchParams})
}

export const addMachineApi = (data: Object): Promise<IResponse> => {
  return request.post({url: 'api/Machines', data})
}

export const editMachineApi = (id: number, data: Object): Promise<IResponse> => {
  return request.put({url: `api/Machines/${id}`, data})
}

export const deleteMachineApi = (id: number): Promise<IResponse> => {
  return request.delete({url: `api/Machines/${id}`})
}

export const detailMachineApi = (id: number): Promise<IResponse> => {
  return request.get({url: `api/Machines/${id}`})
}

export const getMachinesByArea = (areaId: number | null): Promise<IResponse> => {
  return request.get({url: `api/Machines/machinesByArea?areaId=${areaId}`})
}

export const machinesAndThermalDataByArea = (areaId: number | null): Promise<IResponse<any>> => {
  return request.get({url: `api/ThermalDatas/machinesAndThermalDataByArea?areaId=${areaId}`})
}

export const getComponentMachineApi = (searchParams: object): Promise<IResponse> => {
  return request.get({url: '/api/Machines/components', params: searchParams})
}

export const getMultiComponentsMachineApi = (searchParams: object): Promise<IResponse> => {
  return request.get({url: 'api/Machines/multiComponents', params: searchParams, paramsSerializer: serializeFlatParams})
}

export const machinesAndComponentByAreaApi = (searchParams: object): Promise<IResponse> => {
  return request.get({url: '/api/Machines/machinesByArea', params: searchParams})
}
export const getMachineSettingApi = (searchParams: object): Promise<IResponse> => {
  return request.get({url: '/api/Machines/machineSetting', params: searchParams})
}

export const saveMachineSettingApi = (data: any): Promise<IResponse> => {
  return request.post({url: '/api/Machines/machineSetting', data})
}

export const exportMonitorPointsApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({
    url: '/api/machines/exportMonitorPoints',
    params: searchParams,
    responseType: 'blob'
  })
}
export const exportMachineIECApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({
    url: '/api/Machines/exportMachineIEC',
    params: searchParams,
    responseType: 'blob'
  })
}

export const importIECApi = (data: any): Promise<IResponse> => {
  return request.post({
    url: '/api/Machines/importIEC', data, headers: {'Content-Type': 'multipart/form-data'}
  })
}
