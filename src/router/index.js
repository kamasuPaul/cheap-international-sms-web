import Vue from 'vue'
import VueRouter from 'vue-router'
import { getAuth } from 'firebase/auth'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'dashboard',
  }, {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),

    meta: {
      title: 'Dashboard',
      protected: true,
    },
  },
  {
    path: '/about',
    name: 'about',
    meta: {
      auth: true,
    },
    component: () => import('@/views/pages/about/About.vue'),
  },
  {
    path: '/policy',
    name: 'policy',
    component: () => import('@/views/pages/Policy.vue'),
  },
  {
    path: '/login',
    name: 'auth-login',
    component: () => import('@/views/pages/Login.vue'),
    meta: {
      layout: 'blank',
      auth: false,
    },
  },
  {
    path: '/register',
    name: 'auth-register',
    component: () => import('@/views/pages/Register.vue'),
    meta: {
      layout: 'blank',
      auth: false,
    },
  },
  {
    path: '/error-404',
    name: 'error-404',
    component: () => import('@/views/Error.vue'),
    meta: {
      layout: 'blank',
    },
  },
  {
    path: '*',
    redirect: 'error-404',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Cheap International sms'
  const auth = getAuth()

  const { currentUser } = auth

  const requiresAuth = to.matched.some(record => record.meta.protected)

  if (requiresAuth && !currentUser) {
    next('/login') // Redirect to login page if not authenticated
  } else {
    next()
  }
})
Vue.router = router

export default Vue.router
