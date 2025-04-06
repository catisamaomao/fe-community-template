import axios from 'axios'
import { Loading, Message } from 'element-ui'

let loadingInstance = null

const service = axios.create({
  //baseURL: '/http://139.224.104.241:8081/', // 可改为后端地址
  baseURL: '/http://localhost:8081/',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 自定义：需要 loading
    if (config.meta?.loading) {
      loadingInstance = Loading.service({ text: '加载中...', fullscreen: true })
    }

    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    loadingInstance?.close()

    const res = response.data

    // 统一处理业务状态码
    if (res.code !== 200) {
      if (response.config.meta?.showError !== false) {
        Message.error(res.message || '请求失败')
      }

      // 特殊处理：未登录
      if (res.code === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }

      return Promise.reject(res)
    }

    return res
  },
  error => {
    loadingInstance?.close()
    Message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
