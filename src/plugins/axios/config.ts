import type {AxiosResponse, InternalAxiosRequestConfig} from 'axios'
import {ElMessage} from 'element-plus'
import {useUserStoreWithOut} from '@/store/modules/user'

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
    config.headers.set('Content-Type', 'application/json-patch+json')
    config.headers.set('accept', '*/*')
    return config
}

const defaultResponseInterceptors = (response: AxiosResponse) => {
    if (response?.config?.responseType === 'blob') {
        return response
    } else if (response) {
        return response.data
    } else {
        ElMessage.error((response as any)?.message)
        if ((response as any)?.data?.code === 401) {
            const userStore = useUserStoreWithOut()
            userStore.resetAndRedirectToLogin()
        }
    }
}

export {defaultResponseInterceptors, defaultRequestInterceptors}
