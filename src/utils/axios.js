import axios from 'axios'
import { Loading, Message } from 'element-ui'
import router from '@/router'

let loadingInstance = null

const service = axios.create({
  // baseURL: process.env.VUE_APP_API_BASE || 'http://139.224.104.241:8082',
  baseURL: process.env.VUE_APP_API_BASE || 'http://localhost:8082',
  timeout: 10000
})

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

service.interceptors.response.use(
  response => {
    loadingInstance?.close()

    const res = response.data

    // ✅ 兼容 null 情况的判断
    if (!res.success || (res.errorCode && res.errorCode.code !== 0)) {
      Message.error(res.errorCode?.message || '请求异常')

      if (res.errorCode?.code === 401) {
        localStorage.removeItem('token')
        router.push({ name: 'Login' })
      }

      return Promise.reject(res.errorCode?.message || 'Error')
    }

    return res.data // 返回核心业务数据
  },
  error => {
    loadingInstance?.close()
    Message.error(error.message || '网络异常')
    return Promise.reject(error)
  }
)


export default service