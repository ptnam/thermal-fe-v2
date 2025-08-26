export interface UserLoginType {
    username: string
    password: string
}

export interface UserType {
    username?: string
    firstName?: string
    fullName: string
    roleNames: string
    email?: string
    status?: string
}

export interface UserLoginResult {
    token: string
    user: UserType
}