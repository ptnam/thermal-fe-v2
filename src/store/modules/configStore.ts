import {defineStore} from 'pinia'
import {getAllEnumsApi} from '@/api/common'

export const useConfigStore = defineStore('config', {
  state: () => ({
    configs: {} as Record<string, any>,
  }),
  persist: false,
  getters: {},
  actions: {
    getConfig(key: string) {
      return this.configs[key]
    },
    async loadConfig() {
      await getAllEnumsApi().then((res) => {
        this.configs = res.data
      })
    },
    convertToSelect(key: string, colVal = 'id', colLabel = 'name', filter: any = null) {
      return this.convertOptions(this.getConfig(key), colVal, colLabel, filter)
    },
    convertOptions(
      config: any,
      colVal: any = 'id',
      colLabel: any = 'name',
      filter: any = null
    ) {
      const rs: any[] = []

      for (const index in config) {
        if (!filter) {
          rs.push({
            [colVal]: config[index][colVal],
            [colLabel]: config[index][colLabel],
          })
        } else if (filter(config[index])) {
          rs.push({
            [colVal]: config[index][colVal],
            [colLabel]: config[index][colLabel],
          })
        }
      }

      return rs
    },
  },
})
