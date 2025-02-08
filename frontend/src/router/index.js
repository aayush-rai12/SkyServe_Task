import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/Auth/LoginForm.vue';
import RegisterForm from '../components/Auth/RegisterForm.vue';
import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import Filelist from '../components/File/FileList.vue';
import Map from '../components/Map/Map.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
  },
  {
    path: '/filelist',
    name: 'Filelist',
    component: Filelist,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm,
  },
  {
    // path: '/map',
    // name: 'Map',
    // component: () => import('../components/Map/Map.vue'),

    path: '/map',
    name: 'map',
    component: Map,
    props: true  // Enable passing props to the Map.vue component
  },
];

const router = createRouter({
  history: createWebHistory(), // Enables clean URLs without hashes
  routes,
});

export default router;
