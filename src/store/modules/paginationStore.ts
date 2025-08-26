import { defineStore } from 'pinia'
import { getPaginationSettingApi, savePaginationSettingApi } from '@/api/common'
import { TableColumn } from '@/components/Table/types'

export type PaginationSetting = {
  pageCode: string
  pageColumns: GenericObject
}
export const usePaginationStore = defineStore('pagination', {
  state: () => ({
    configs: {} as Record<string, any>,
  }),
  persist: false,
  getters: {},
  actions: {
    getConfig(key: string, tableColumns?: TableColumn[]) {
      const dbColumns = this.configs[key] ?? []
      const columns = {}
      if (tableColumns) {
        for (const item of tableColumns) {
          if (item.prop && item.label) {
            columns[item.prop] = dbColumns[item.prop] ?? true
          }
        }
      }
      return columns
    },
    async loadConfig() {
      await getPaginationSettingApi().then((res) => {
        const configTmp = {}
        for (const item of res.data) {
          configTmp[item.pageCode] = item.pageColumnsObj
        }
        this.configs = configTmp
      })
    },
    save(paginationSetting: PaginationSetting) {
      this.configs[paginationSetting.pageCode] = paginationSetting.pageColumns
      void savePaginationSettingApi({
        pageCode: paginationSetting.pageCode,
        pageColumns: JSON.stringify(paginationSetting.pageColumns),
      })
    },
  },
})
