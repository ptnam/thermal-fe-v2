import request from '@/plugins/axios'

export const getAllAreaApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Areas/All', params: searchParams})
}

export const getAllTreeAreaApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Areas/allTree', params: searchParams})
}

export const getAreaListApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Areas/list', params: searchParams})
}

export const getFlatTreeApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Areas/flatTree', params: searchParams})
}

export const addAreaApi = (data: any): Promise<IResponse> => {
    return request.post({url: 'api/Areas', data})
}

export const editAreaApi = (id: number, data: any): Promise<IResponse> => {
    return request.put({url: `api/Areas/${id}`, data})
}

export const deleteAreaApi = (id: number): Promise<IResponse> => {
    return request.delete({url: `api/Areas/${id}`})
}
