// UTILS
import { createRouter, createWebHistory,type RouteRecordRaw } from 'vue-router';
// LAYOUTS
import DefaultLayout from '@/layouts/default.vue';
// PAGES
import Landing from '@/views/landing.vue';
import Products from '@/views/products.vue';

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
      {
        path: 'products',
        name: 'Products',
        component: Products,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;