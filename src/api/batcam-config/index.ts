import request from '@/plugins/axios'

// Đọc/ghi cấu hình THẬT trên thiết bị BATCAM FX2 (BE proxy xuống camera), không phải cấu hình trong DB.

export const getBatcamRoisApi = (cameraId: number): Promise<IResponse<any>> => {
  return request.get({ url: `api/BatCamConfig/${cameraId}/roi` })
}

export const saveBatcamRoiApi = (cameraId: number, roiIndex: number, data: any): Promise<IResponse<any>> => {
  return request.put({ url: `api/BatCamConfig/${cameraId}/roi/${roiIndex}`, data })
}

export const getBatcamAiSettingApi = (cameraId: number): Promise<IResponse<any>> => {
  return request.get({ url: `api/BatCamConfig/${cameraId}/ai` })
}

export const saveBatcamAiSettingApi = (cameraId: number, data: any): Promise<IResponse<any>> => {
  return request.patch({ url: `api/BatCamConfig/${cameraId}/ai`, data })
}

export const getBatcamMeasurementSettingApi = (cameraId: number): Promise<IResponse<any>> => {
  return request.get({ url: `api/BatCamConfig/${cameraId}/measurement` })
}

export const saveBatcamMeasurementSettingApi = (cameraId: number, data: any): Promise<IResponse<any>> => {
  return request.patch({ url: `api/BatCamConfig/${cameraId}/measurement`, data })
}
