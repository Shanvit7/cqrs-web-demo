import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from '@/app.vue';
import router from '@/routes/index';
import "@/styles/tailwind.css";

const app = createApp(App);

// Setup Pinia for state management with persistence
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Setup Vue Query for data fetching
app.use(VueQueryPlugin);

// Setup Router
app.use(router);

app.mount('#app');