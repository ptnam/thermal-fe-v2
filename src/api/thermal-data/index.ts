import request from '@/plugins/axios'

export const thermalByComponent = (machineId: number, componentId: number) => {
    return request.get({
        url: `/api/ThermalDatas/thermalByComponent?machineId=${machineId}&componentId=${componentId}`,
    })
}

export const listThermalsApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/list', params: searchParams})
}

export const listThermalGroupApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/listGroup', params: searchParams})
}

export const hourlyThermalDataApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/hourlyThermalData', params: searchParams})
}

export const dailyThermalDataApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/dailyThermalData', params: searchParams})
}

export const timeThermalDataApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/detailThermalData', params: searchParams})
}
export const componentThermalDataApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/componentThermalData', params: searchParams})
}

export const thermalByComponentApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/thermalByComponent', params: searchParams})
}
export const realTimeThermalDataApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/realTimeThermalData', params: searchParams})
}

export const machinesAndResultByAreaApi = (searchParams: object): Promise<any> => {
    return request.get({url: '/api/ThermalDatas/machinesAndResultByArea', params: searchParams})
}
export const environmentThermalApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/ThermalDatas/environmentThermal', params: searchParams})
}

export const thermalDataByAreaApi = (data: object): Promise<IResponse<[]>> => {
    return request.post({url: '/api/ThermalDatas/thermalDataByArea', data})
}
export const thermalExportApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({
        url: '/api/Export/exportThermalData',
        params: searchParams,
    })
}

