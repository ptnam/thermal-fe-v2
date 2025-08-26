import { defineStore } from 'pinia'

export const useStreamPage = defineStore('streamPage', {
  state: () => ({
    screenNumber: 4,
  }),
  persist: true
})
