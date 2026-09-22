import request from '@/plugins/axios'

export const listPdDataApi = (searchParams: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/PdData/list', params: searchParams })
}

// Job nền: chỉ trả jobId, file thật về qua SignalR "exportCompleted".
export const pdDataExportApi = (searchParams: object): Promise<IResponse<any>> => {
  return request.get({ url: '/api/Export/exportPdData', params: searchParams })
}

export const pdChartByTimeApi = (searchParams: object): Promise<IResponse<any>> => {
  return request.get({ url: '/api/PdData/chartByTime', params: searchParams })
}

export const pdTopComponentsApi = (searchParams: object): Promise<IResponse<any>> => {
  return request.get({ url: '/api/PdData/topComponents', params: searchParams })
}

export const pdLevelDistributionApi = (searchParams: object): Promise<IResponse<any>> => {
  return request.get({ url: '/api/PdData/levelDistribution', params: searchParams })
}

export const pdByMachineApi = (machineId: number): Promise<IResponse<any>> => {
  return request.get({ url: `/api/PdData/byMachine/${machineId}` })
}

export const pdLevelsByMachineApi = (machineId: number): Promise<IResponse<any>> => {
  return request.get({ url: `/api/PdData/byMachine/${machineId}/levels` })
}
