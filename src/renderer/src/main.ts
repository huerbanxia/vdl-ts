import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 暗黑模式支持
import 'element-plus/theme-chalk/dark/css-vars.css'
// 暗黑模式自定义样式
import './assets/css/dark.less'

import useSettingStore from './store/useSettingStore'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')

// 初始化设置
useSettingStore().init()
