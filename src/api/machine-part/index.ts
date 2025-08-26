import request from '@/plugins/axios'

export const getAllMachinePartApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/MachineParts/All', params: searchParams})
}

export const getMachinePartAllTreeApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/MachineParts/allTree', params: searchParams})
}
export const getMachinePartListApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/MachineParts/list', params: searchParams})
}

export const addMachinePartApi = (data: Object): Promise<IResponse> => {
    return request.post({url: 'api/MachineParts', data})
}

export const editMachinePartApi = (id: number, data: Object): Promise<IResponse> => {
    return request.put({url: `api/MachineParts/${id}`, data})
}

export const deleteMachinePartApi = (id: number): Promise<IResponse> => {
    return request.delete({url: `api/MachineParts/${id}`})
}

export const detailMachinePartApi = (id: number): Promise<IResponse> => {
    return request.get({url: `api/MachineParts/${id}`})
}