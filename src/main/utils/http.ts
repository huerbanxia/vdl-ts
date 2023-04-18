import axios, { CreateAxiosDefaults, AxiosInstance } from 'axios'
import log from './log'
import { getDefaultHeaders } from './header'
import { setting } from '../setting'

const createAxios = (): AxiosInstance => {
  // 准备axios实例配置
  const options: CreateAxiosDefaults = {
    timeout: setting.axios.timeout
  }
  // 设置代理
  if (setting.isOpenProxy) {
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
      log.debug('当前请求的代理配置:', config.proxy)
      config.headers = getDefaultHeaders()
      if (setting.axios.authorization) {
        config.headers['Authorization'] = 'Bearer ' + setting.axios.authorization
      }
      return config
    },
    (error) => {
      log.error(error) // for debug
      return Promise.reject(error)
    }
  )
  // 响应拦截
  service.interceptors.response.use(
    (response) => {
      const headers = response.headers
      const res = response.data
      if (response.status !== 200) {
        log.error('接口信息报错1', res.message)
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
      log.error('接口信息报错2', error)
      return Promise.reject(error)
    }
  )
  return service
}

let http = createAxios()

const resetAxios = (): void => {
  http = createAxios()
}

export { http, resetAxios }
