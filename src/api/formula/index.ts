import request from '@/plugins/axios'

export const listFormulasApi = (searchParams?: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/Formula/list', params: searchParams })
}

export const addFormulaApi = (data: object): Promise<IResponse> => {
  return request.post({ url: '/api/Formula', data })
}

export const editFormulaApi = (id: number, data: object): Promise<IResponse> => {
  return request.put({ url: `/api/Formula/${id}`, data })
}

export const deleteFormulaApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `/api/Formula/${id}` })
}

export const validateFormulaApi = (
  data: object
): Promise<IResponse<{ isValid: boolean; result?: number; errorMessage?: string }>> => {
  return request.post({ url: '/api/Formula/validate', data })
}

export const listFormulaVariablesApi = (searchParams?: object): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/Formula/variables', params: searchParams })
}

export const addFormulaVariableApi = (data: object): Promise<IResponse> => {
  return request.post({ url: '/api/Formula/variables', data })
}

export const editFormulaVariableApi = (id: number, data: object): Promise<IResponse> => {
  return request.put({ url: `/api/Formula/variables/${id}`, data })
}

export const deleteFormulaVariableApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `/api/Formula/variables/${id}` })
}

export const previewFormulaVariableApi = (
  data: object
): Promise<IResponse<{ hasData: boolean; value?: number; message?: string }>> => {
  return request.post({ url: '/api/Formula/variables/preview', data })
}

// targetType: 1 = bộ phận, 2 = loại bộ phận.
export const listFormulaAssignmentsApi = (searchParams: {
  targetType: number
  targetId: number
  thresholdType: number
}): Promise<IResponse<[]>> => {
  return request.get({ url: '/api/Formula/assignments', params: searchParams })
}

export const addFormulaAssignmentApi = (data: object): Promise<IResponse> => {
  return request.post({ url: '/api/Formula/assignments', data })
}

export const deleteFormulaAssignmentApi = (id: number): Promise<IResponse> => {
  return request.delete({ url: `/api/Formula/assignments/${id}` })
}
