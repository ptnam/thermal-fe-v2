import request from '@/plugins/axios'

export const getCameraSettingApi = (): Promise<IResponse<GenericObject>> => {
    return request.get({url: '/api/CameraSettings'})
}

export const updateCameraSettingApi = (data: Object): Promise<IResponse> => {
    return request.post({url: 'api/CameraSettings', data})
}