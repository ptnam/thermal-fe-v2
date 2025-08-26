import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginState from 'pinia-plugin-persistedstate'

const store = createPinia()

store.use(piniaPluginState)

export const setupStore = (app: App<Element>) => {
  app.use(store)
}

export { store }
