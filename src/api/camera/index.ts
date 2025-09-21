import request from '@/plugins/axios'

export const getAllCamerasApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Cameras/All', params: searchParams})
}

export const getAllTreeCameraApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Cameras/allTree', params: searchParams})
}

export const getCameraListApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Cameras/list', params: searchParams})
}
export const getVisionPresetsApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/cameras/visionPresets', params: searchParams})
}

export const addCameraApi = (data: any): Promise<IResponse> => {
    return request.post({url: 'api/Cameras', data})
}

export const editCameraApi = (id: number, data: any): Promise<IResponse> => {
    return request.put({url: `api/Cameras/${id}`, data})
}

export const deleteCameraApi = (id: number): Promise<IResponse> => {
    return request.delete({url: `api/Cameras/${id}`})
}

export const setViewingAngleApi = (id: number, data: any): Promise<IResponse> => {
    return request.put({url: `api/Cameras/${id}`, data})
}

export const getStreamApi = (id: any): Promise<IResponse> => {
    return request.get({url: `api/Cameras/stream/${id}`})
}

export const syncPresetsApi = (id: any): Promise<IResponse> => {
    return request.post({url: `api/Cameras/syncPresets/${id}`})
}

export const listPresetsApi = (id: any): Promise<IResponse> => {
    return request.get({url: `api/Cameras/presets/${id}`})
}

export const sendCommandCameraApi = (params: object): Promise<IResponse> => {
    return request.post({url: 'api/Cameras/control', data: params})
}
export const playTourApi = ( data: object): Promise<IResponse> => {
    return request.post({url: '/api/cameras/tourCommand', data: data})
}

export const visionPresetApi = ( data: any): Promise<IResponse> => {
    return request.post({url: '/api/cameras/visionPresets', data: data})
}

export const invokePresetApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/cameras/invokePreset', params: searchParams})
}