import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useChatStore } from '../stores/chat'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const chatStore = useChatStore()
  const isAuthenticated = !!chatStore.currentUser

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // 已登录用户访问登录页，重定向到聊天页
    next({ name: 'Chat' })
  } else {
    next()
  }
})

export default router 