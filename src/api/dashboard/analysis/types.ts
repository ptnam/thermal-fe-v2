export type AnalysisTotalTypes = {
    users: number
    messages: number
    moneys: number
    shoppings: number
}

export type UserAccessSource = {
    value: number
    name: string
}

export type WeeklyUserActivity = {
    value: number
    name: string
}

export type MonthlySales = {
    name: string
    estimate: number
    actual: number
}

export type Device = {
    id: number,
    name: string,
    status: string,
    ip: string,
    port: number,
    createTime: Date | number | string
    lat: number
    lng: number
}