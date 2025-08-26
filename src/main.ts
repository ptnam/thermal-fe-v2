import './assets/styles/main.scss'
import './assets/styles/tailwind.css'
import 'virtual:svg-icons-register'
import {setupI18n} from '@/plugins/vueI18n'
import {setupStore} from '@/store'
import {setupRouter} from './router'
import {createApp} from 'vue'
import App from './App.vue'

import './permission'

const setupAll = async () => {
    const app = createApp(App)

    await setupI18n(app)
    setupStore(app)
    setupRouter(app)
    app.mount('#app')
    return app;
}

export default setupAll()
