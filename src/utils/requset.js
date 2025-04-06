import axios from './axios'

export const get = (url, params = {}, config = {}) =>
  axios.get(url, { params, meta: { loading: true, ...config } })

export const post = (url, data = {}, config = {}) =>
  axios.post(url, data, { meta: { loading: true, ...config } })

export const put = (url, data = {}, config = {}) =>
  axios.put(url, data, { meta: { loading: true, ...config } })

export const del = (url, data = {}, config = {}) =>
  axios.delete(url, { data, meta: { loading: true, ...config } })
