import axios, { CreateAxiosDefaults } from 'axios'
import { setting } from '../setting'

const options: CreateAxiosDefaults = {
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: setting.axios.timeout
}

// 设置代理
if (setting.proxy) {
  options.proxy = {
    protocol: setting.proxy.protocol,
    host: setting.proxy.host,
    port: setting.proxy.port
  }
}

const service = axios.create(options)
// 请求拦截
service.interceptors.request.use(
  (config) => {
    if (setting.axios.authorization) {
      config.headers['Authorization'] = 'Bearer ' + setting.axios.authorization
    }
    return config
  },
  (error) => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)
// 响应拦截
service.interceptors.response.use(
  (response) => {
    const headers = response.headers
    const res = response.data
    if (response.status !== 200) {
      console.log('接口信息报错1', res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    } else if (headers['content-type'] === 'application/json; charset=utf-8') {
      // 返回值为json则直接吧data返回
      return res
    } else {
      // 其他情况下返回返回response
      return Promise.resolve(response)
    }
  },
  (error) => {
    console.log('接口信息报错2' + error)
    return Promise.reject(error)
  }
)

export default service
