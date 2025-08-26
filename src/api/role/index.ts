import request from '@/plugins/axios'

export const getRoleListApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Roles/list', params: searchParams})
}

export const getAllRoleApi = (): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Roles/All'})
}
export const addRoleApi = (data: Object): Promise<IResponse> => {
    return request.post({url: 'api/Roles', data})
}

export const editRoleApi = (id: number, data: Object): Promise<IResponse> => {
    return request.put({url: `api/Roles/${id}`, data})
}

export const deleteRoleApi = (id: number): Promise<IResponse> => {
    return request.delete({url: `api/Roles/${id}`})
}
export const getAllFeaturesApi = (): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Roles/AllFeatures'})
}
