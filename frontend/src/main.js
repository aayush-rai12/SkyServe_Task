import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axiosInstance from './utils/apiClient'; // Import Axios instance

const app = createApp(App);

// Make Axios globally available
app.config.globalProperties.$http = axiosInstance;

app.use(router).mount('#app');
