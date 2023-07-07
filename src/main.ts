import { createApp } from 'vue'
import './scss/normalize.css'
import './scss/markdown.css'
import './scss/index.scss';

import App from './App.vue'
import router from './router'
import store from './store'
import {createRouterGuard} from './permission'
import {loadComponents} from './components';
import {loadDirectives} from './directive';

createRouterGuard(router)
let app = createApp(App)
    .use(store)
    .use(router)

loadComponents(app)
loadDirectives(app)
app.mount('#app')