import type {AxiosResponse, InternalAxiosRequestConfig} from 'axios'
import {ElMessage} from 'element-plus'
import {useUserStoreWithOut} from '@/store/modules/user'
import {useLocaleStoreWithOut} from '@/store/modules/locale'

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
    config.headers.set('accept', '*/*')
    config.headers.set('Accept-Language', useLocaleStoreWithOut().getCurrentLocale.lang)
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
