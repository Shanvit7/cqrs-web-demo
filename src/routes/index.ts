// UTILS
import { createRouter, createWebHistory,type RouteRecordRaw } from 'vue-router';
// LAYOUTS
import DefaultLayout from '@/layouts/default.vue';
// PAGES
import Landing from '@/views/landing.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'DefaultLayout',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Landing',
        component: Landing,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;