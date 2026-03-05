import request from '@/plugins/axios'

export const getAllMachineTypeApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/MachineTypes/All', params: searchParams })
}
export const getMachineTypeListApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/MachineTypes/list', params: searchParams })
}


export const getDetailMachineTypeApi = (id: number): Promise<IResponse> => {
  return request.get({url: `api/MachineTypes/${id}`})
}

export const addMachineTypeApi = (data: Object): Promise<IResponse> => {
  return request.post({ url: 'api/MachineTypes', data })
}

export const editMachineTypeApi = (id: number, data: Object): Promise<IResponse> => {
  return request.put({ url: `api/MachineTypes/${id}`, data })
}

export const deleteMachineTypeApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `api/MachineTypes/${id}` })
}
