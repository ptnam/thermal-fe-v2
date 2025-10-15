import request from '@/plugins/axios'

export const getAllMachineApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Machines/All', params: searchParams})
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
    return request.get({url: 'api/Machines/multiComponents', params: searchParams})
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
