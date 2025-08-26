import {reactive} from 'vue'
import {useRoute} from 'vue-router'

export function useSearch<T extends Record<string, any>>(defaults: T) {
    const route = useRoute()

    // Merge defaults with URL query (query values are strings or arrays)
    const searchParams = reactive<T>({
        ...defaults,
        ...route.query
    } as T)

    return {
        searchParams: searchParams
    }
}
