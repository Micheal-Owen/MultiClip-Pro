import { createRouter, createWebHashHistory } from 'vue-router'
import TheWelcome from '../components/TheWelcome.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TheWelcome
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../components/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
