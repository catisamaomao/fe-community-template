import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
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
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/AppProfile.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/AppRegister.vue')
  },
  { path: '/email-login', name: 'EmailLogin', component: ()=> import('../views/AppEmailLogin.vue')  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router