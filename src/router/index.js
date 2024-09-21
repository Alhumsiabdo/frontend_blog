import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import routes from '@/router/routes'
import { sidebarState } from '@/composables'

const router = createRouter({
  history: createWebHashHistory('kui-dashboard-vue'),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') // Check for JWT token

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    // If the route requires authentication and the user is not logged in
    next({ name: 'Login' }) // Redirect to login page
  } else if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    // If the route is for guests (e.g., Login) but the user is already logged in
    next({ name: 'Dashboard' }) // Redirect to the dashboard
  } else {
    // Otherwise, allow navigation
    next()
  }
})

router.beforeEach(() => {
  NProgress.start()
})

router.afterEach(() => {
  if (window.innerWidth <= 1024) {
    sidebarState.isOpen = false
  }
  NProgress.done()
})

export default router
