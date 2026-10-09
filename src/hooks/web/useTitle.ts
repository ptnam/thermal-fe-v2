import {useAppStoreWithOut} from '@/store/modules/app'
import {useLang} from '@/hooks/web/useI18n'
import {RouteLocationMatched, RouteLocationNormalizedGeneric} from 'vue-router'

export const routerTitle = (route?: RouteLocationNormalizedGeneric | RouteLocationMatched) => {
    const {t} = useLang()
    const name = route?.name?.toString() ?? "";
    return name ? t(`router.${name}`) : ''
}
export const useTitle = (route?: RouteLocationNormalizedGeneric) => {
    const appStore = useAppStoreWithOut()
    const newTitle = routerTitle(route)
    const title = newTitle ? `${appStore.getTitle} - ${newTitle}` : appStore.getTitle
    document.title = title
    return title
}
