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
        path: 'user',
        name: 'UserManage',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'info',
            name: 'UserInfoTab',
            component: () => import('@/views/user/AppUserInfoTab.vue')
          }
        ]
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
      },
      {
        path: 'console',
        name: 'Console',
        component: () => import('@/views/console/AppConsole.vue'),
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            redirect: 'dictionary'
          },
          {
            path: 'dictionary',
            name: 'DictionaryManage',
            component: () => import('@/views/console/dictionary/AppDictionaryManage.vue')
          }
        ]
      },
      {
        path: 'department',
        name: 'DepartmentManager',
        component: () => import('@/views/department/AppDepartmentManager.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'movement',
        name: 'MemberMovement',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'entry',
            name: 'MovementEntry',
            component: () => import('@/views/entry/AppEntryAdmin.vue')
          },
          {
            path: 'change',
            name: 'MovementChange',
            component: () => import('@/views/change/AppChangeRecordTab.vue')
          },
          {
            path: 'leave',
            name: 'MovementLeave',
            component: () => import('@/views/leave/AppLeaveAdmin.vue')
          }
        ]
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
