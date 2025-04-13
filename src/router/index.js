import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/AppHome.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'dashboard',
      },
      {
        path: 'dashboard',
        name: 'AppHomeDashboard',
        component: () => import('../views/AppHomeDashboard.vue')
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/AppProfile.vue')
      },
      {
        path: 'announcement',
        name: 'AppAnnouncement',
        component: () => import('@/views/announcement/AppAnnouncement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'documentation',
        name: 'DocumentationTab',
        component: () => import('@/views/documentation/AppDocumentationTab.vue')
      },
      {
        path: 'activity',
        name: 'ActivityTab',
        component: () => import('@/views/activity/AppActivityTab.vue')
      }
    ]
    
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/AppLogin.vue')
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../views/AppForum.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/AppRegister.vue')
  },
  {
    path: '/email-login',
    name: 'EmailLogin',
    component: () => import('../views/AppEmailLogin.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// ✅ 全局前置守卫只判断是否登录
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      return next('/login')
    }
  }

  next()
})

export default router
