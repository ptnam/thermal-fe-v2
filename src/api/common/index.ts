import request from '@/plugins/axios'

export const getAllEnumsApi = () => {
    return request.get({url: '/api/CommonLists/allEnums'})
}

export const summariseInfoApi = () => {
    return request.get({url: '/api/Dashboard/summariseInfo'})
}

export const getPaginationSettingApi = () => {
    return request.get({url: '/api/PageSettings/all'})
}

export const savePaginationSettingApi = (paginationSetting: object) => {
    return request.post({url: '/api/PageSettings', data: paginationSetting})
}

export const downloadByPathApi = (path: string, searchParams?: object): Promise<IResponse<[]>> => {
    return request.get({
        url: path,
        params: searchParams,
        responseType: 'blob'
    })
}