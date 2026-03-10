import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import scui from './scui'
import router from './router'
import App from './App.vue'
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.use(scui);

//挂载app
app.mount('#app');
