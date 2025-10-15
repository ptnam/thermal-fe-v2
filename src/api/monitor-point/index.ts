import request from '@/plugins/axios'

export const getAllMonitorPointApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/MonitorPoints/All', params: searchParams})
}

export const getAllMonitorPointByCamApi = (camId: number): Promise<IResponse<[]>> => {
    return request.get({url: `/api/MonitorPoints/allByCamAndStatus/${camId}`})
}

export const getAllMonitorPointBySensorApi = (sensorId: number): Promise<IResponse<[]>> => {
    return request.get({url: `/api/MonitorPoints/allBySensorAndStatus/${sensorId}`})
}
export const getMonitorPointListApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/MonitorPoints/list', params: searchParams})
}

export const addMonitorPointApi = (data: Object): Promise<IResponse> => {
    return request.post({url: 'api/MonitorPoints', data})
}

export const editMonitorPointApi = (id: number, data: Object): Promise<IResponse> => {
    return request.put({url: `api/MonitorPoints/${id}`, data})
}

export const deleteMonitorPointApi = (id: number): Promise<IResponse> => {
    return request.delete({url: `api/MonitorPoints/${id}`})
}

export const allMonitorPointsByMachineComponentApi = (searchParams: object | null): Promise<IResponse> => {
    return request.get({url: 'api/MonitorPoints/allByMachineComponent', params: searchParams})
}
