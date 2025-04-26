import axios from 'axios'
import { Loading, Message } from 'element-ui'
import router from '@/router'

let loadingInstance = null

const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE || 'http://localhost:8082',
  timeout: 10000
})

// 请求拦截
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.meta?.loading) {
    loadingInstance = Loading.service({
      text: config.meta.loadingText || '加载中...',
      fullscreen: true
    })
  }

  return config
})

// 响应拦截
service.interceptors.response.use(
  response => {
    loadingInstance?.close()

    const res = response.data

    if (res == null || typeof res !== 'object') {
      return {}
    }

    if (res.success === false || (res.errorCode && res.errorCode.code !== 0)) {
      // 有后端返回信息，就友好弹出，不爆红
      Message.error(res.errorCode?.message || '请求异常喵～')

      // 401业务错误，跳登录
      if (res.errorCode?.code === 401) {
        localStorage.removeItem('token')
        router.push({ name: 'Login' })
      }

      // 业务严重错误（错误码大于等于1000），跳500页面
      if (res.errorCode?.code >= 1000) {
        router.push({ name: 'ServerError' })
      }

      //返回Promise.reject，但不new Error了，避免浏览器大红屏
      return Promise.reject(res.errorCode?.message || '请求失败')
    }

    // 正常返回
    return res.data || {}
  },
  error => {
    loadingInstance?.close()

    if (error.response) {
      const status = error.response.status

      switch (status) {
        case 401:
          localStorage.removeItem('token')
          router.push({ name: 'Login' })
          break
        case 403:
          router.push({ name: 'Forbidden' })
          break
        case 404:
          router.push({ name: 'NotFound' })
          break
        case 500:
          router.push({ name: 'ServerError' })
          break
        default:
          Message.error(error.response.data.message || '请求出错了喵～')
      }
    } else {
      // 网络错误，比如 Network Error，也跳500
      router.push({ name: 'ServerError' })
    }

    // 返回Promise.reject，但不new Error，避免爆红
    return Promise.reject(error.message || '网络异常喵～')
  }
)

export default service
