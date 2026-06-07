import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/base.scss'

// 이 파일에서 배우는 것: Vue 앱 생성 → Pinia/Router 플러그인 연결 → 실제 DOM 마운트까지의 시작 흐름입니다.
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
