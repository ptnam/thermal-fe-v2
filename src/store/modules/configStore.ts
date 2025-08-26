import { defineStore } from 'pinia'
import { getAllEnumsApi } from '@/api/common'

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
    convertToSelect(key: string, colVal = 'id', colLabel = 'name') {
      return this.convertOptions(this.getConfig(key), colVal, colLabel)
    },
    convertOptions(config: object, colVal = 'id', colLabel = 'name') {
      let rs = []
      for (let index in config) {
        // @ts-ignore
        rs.push({ [colVal]: config[index][colVal], [colLabel]: config[index][colLabel] })
      }
      return rs
    },
  },
})
