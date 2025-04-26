import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/AppHome.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: 'dashboard' },
      {
        path: 'dashboard',
        name: 'AppHomeDashboard',
        component: () => import('@/views/AppHomeDashboard.vue')
      },
      {
        path: 'user',
        name: 'UserManage',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'info',
            name: 'UserInfoTab',
            component: () => import('@/views/user/AppUserInfoTab.vue'),
            meta: { requiresAuth: true, permissionCode: 'MENU_USER' }
          }
        ]
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/AppProfile.vue'),
        meta: { requiresAuth: true }
        // 个人资料页，不加 permissionCode
      },
      {
        path: 'announcement',
        name: 'AppAnnouncement',
        component: () => import('@/views/announcement/AppAnnouncement.vue'),
        meta: { requiresAuth: true, permissionCode: 'MENU_ANNOUNCEMENT' }
      },
      {
        path: 'documentation',
        name: 'DocumentationTab',
        component: () => import('@/views/documentation/AppDocumentationTab.vue'),
        meta: { requiresAuth: true, permissionCode: 'MENU_DOCUMENTATION' }
      },
      {
        path: 'activity',
        name: 'ActivityTab',
        component: () => import('@/views/activity/AppActivityTab.vue'),
        meta: { requiresAuth: true, permissionCode: 'MENU_ACTIVITY' }
      },
      {
        path: 'console',
        name: 'Console',
        component: () => import('@/views/console/AppConsole.vue'),
        meta: { requiresAuth: true, permissionCode: 'MENU_CONSOLE' },
        children: [
          { path: '', redirect: 'dictionary' },
          {
            path: 'dictionary',
            name: 'DictionaryManage',
            component: () => import('@/views/console/dictionary/AppDictionaryManage.vue'),
            meta: { requiresAuth: true, permissionCode: 'MENU_CONSOLE_DICTIONARY' }
          },
          {
            path: 'role',
            name: 'RoleManage',
            component: () => import('@/views/console/role/AppRoleManage.vue'),
            meta: { requiresAuth: true, permissionCode: 'MENU_CONSOLE_ROLE' }
          },
          {
            path: 'permission',
            name: 'PermissionManage',
            component: () => import('@/views/console/permission/AppPermissionManage.vue'),
            meta: { requiresAuth: true, permissionCode: 'MENU_CONSOLE_PERMISSION' }
          }
        ]
      },
      {
        path: 'department',
        name: 'DepartmentManager',
        component: () => import('@/views/department/AppDepartmentManager.vue'),
        meta: { requiresAuth: true, permissionCode: 'MENU_DEPARTMENT' }
      },
      {
        path: 'movement',
        name: 'MemberMovement',
        component: { render: h => h('router-view') },
        children: [
          {
            path: 'entry',
            name: 'MovementEntry',
            component: () => import('@/views/entry/AppEntryAdmin.vue'),
            meta: { requiresAuth: true, permissionCode: 'MENU_MOVEMENT_ENTRY' }
          },
          {
            path: 'change',
            name: 'MovementChange',
            component: () => import('@/views/change/AppChangeRecordTab.vue'),
            meta: { requiresAuth: true, permissionCode: 'MENU_MOVEMENT_CHANGE' }
          },
          {
            path: 'leave',
            name: 'MovementLeave',
            component: () => import('@/views/leave/AppLeaveAdmin.vue'),
            meta: { requiresAuth: true, permissionCode: 'MENU_MOVEMENT_LEAVE' }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/AppLogin.vue')
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('@/views/AppForum.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/AppRegister.vue')
  },
  {
    path: '/email-login',
    name: 'EmailLogin',
    component: () => import('@/views/AppEmailLogin.vue')
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/App403Page.vue')
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '*',
    redirect: '/403'
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// 全局前置守卫：登录+权限验证
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      return next('/login')
    }

    const requiredCode = to.meta.permissionCode
    if (requiredCode && !userPermissions.includes(requiredCode)) {
      return next('/403')
    }
  }

  next()
})

export default router
