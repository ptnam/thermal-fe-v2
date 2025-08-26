import request from "@/plugins/axios";

export const getLastestNotificationApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: 'api/Notifications/lastest', params: searchParams})
}

export const listNotificationApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Notifications/list', params: searchParams})
}

export const lastestBriefApi = (): Promise<IResponse<[]>> => {
    return request.get({url: '/api/Notifications/lastestBrief'})
}

export const notificationsCountApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: 'api/Notifications/count', params: searchParams})
}

export const notificationExportApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({
        url: '/api/Export/exportNotifications',
        params: searchParams,
    })
}
export const notificationDetailApi = (searchParams: object): Promise<IResponse<[]>> => {
    return request.get({url: 'api/Notifications', params: searchParams})
}
export const updateNotificationStatusApi = (id: number, data: any): Promise<IResponse<[]>> => {
    return request.put({url: `/api/Notifications/${id}`, data: data})
}