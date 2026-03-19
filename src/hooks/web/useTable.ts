import {ref, reactive, toRaw, unref, watch, nextTick, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {ElMessage, ElMessageBox, ElTable} from 'element-plus'

import {BaseTable, TableExpose, TableSetProps, TableColumn} from '@/components/Table'
import {useLang} from '@/hooks/web/useI18n'

const {t} = useLang()

export interface UseTableConfig<T extends Record<string, any> = any> {
    immediate?: boolean,
    fetchDataApi: (params?: Record<string, any>) => Promise<any>
    searchDefaults?: T,
    fetchSuccess?: (...params: any[]) => void
    formatDataList?: (...params: any[]) => any[]
}

export const useTable = <T extends Record<string, any> = Record<string, any>>(config: UseTableConfig<T>) => {
    const {immediate = true, searchDefaults = {} as T} = config

    const route = useRoute()
    const searchParams = reactive<T>({
        ...searchDefaults,
        ...route.query
    } as T)

    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const rowIndex = ref(0)
    const lastRowIndex = ref(0)
    const dataList = ref<any[]>([])
    const tableRef = ref<typeof BaseTable & TableExpose>()
    const elTableRef = ref<ComponentRef<typeof ElTable>>()
    let isPageSizeChange = false

    watch(() => currentPage.value, () => {
        if (!isPageSizeChange) void methods.getList()
        isPageSizeChange = false
    })

    watch(() => pageSize.value, () => {
        if (unref(currentPage) === 1) {
            void methods.getList()
        } else {
            currentPage.value = 1
            isPageSizeChange = true
            void methods.getList()
        }
    })

    onMounted(() => {
        if (immediate) {
            void methods.getList()
        }
    })

    const register = (ref: typeof BaseTable & TableExpose, elRef: ComponentRef<typeof ElTable>) => {
        tableRef.value = ref
        elTableRef.value = unref(elRef)
    }

    const getTable = async () => {
        await nextTick()
        const table = unref(tableRef)
        if (!table) {
            console.error('The table is not registered. Please use the register method to register')
        }
        return table
    }

    const methods = {
        getList: async () => {
            loading.value = true
            try {
                const res = await config.fetchDataApi({
                    ...toRaw(searchParams),
                    page: currentPage.value,
                    pageSize: pageSize.value
                })
                if (res) {
                    config?.fetchSuccess && config.fetchSuccess(res)
                    if (config?.formatDataList) {
                        dataList.value = config?.formatDataList(res.data.items)
                    } else {
                        dataList.value = res.data.items
                    }
                    total.value = res.data.totalRow ?? 0
                    rowIndex.value = res.data.rowIndex ?? 0
                    lastRowIndex.value = res.data.lastRowIndex ?? 0
                    pageSize.value = res.data.pageSize ?? 10
                }
            } catch (err) {
                console.error('fetchDataApi error', err)
            } finally {
                loading.value = false
            }
        },

        setColumn: async (columnProps: TableSetProps[]) => {
            const table = await getTable()
            table?.setColumn(columnProps)
        },

        addColumn: async (tableColumn: TableColumn, index?: number) => {
            const table = await getTable()
            table?.addColumn(tableColumn, index)
        },

        delColumn: async (field: string) => {
            const table = await getTable()
            table?.delColumn(field)
        },

        getElTableExpose: async () => {
            await getTable()
            return unref(elTableRef)
        },

        refresh: () => {
            void methods.getList()
        },

        deleteRow: async (fetchDelApi: (...args: any[]) => Promise<any>, ...args: any[]) => {
            ElMessageBox.confirm(t('common.delMessage'), t('common.delWarning'), {
                confirmButtonText: t('common.delOk'),
                cancelButtonText: t('common.cancel'),
                type: 'warning',
            }).then(async () => {
                const res = await fetchDelApi(args)
                if (res) {
                    ElMessage.success(t('common.delSuccess'))
                    void methods.getList()
                }
            })
        },

        getSelectionRows: async () => {
            const table = await methods.getElTableExpose()
            return table?.getSelectionRows()
        },
    }

    return {
        searchParams,
        tableRegister: register,
        tableMethods: methods,
        tableState: {
            currentPage,
            pageSize,
            total,
            rowIndex,
            lastRowIndex,
            dataList,
            loading,
        },
    }
}
