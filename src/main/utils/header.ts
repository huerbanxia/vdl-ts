import { AxiosRequestHeaders } from 'axios'
import { chrome } from './browsers.json'

function getDefaultHeaders(defaults?: object): AxiosRequestHeaders {
  const headers = getChromeHeaders(random(chrome))
  return Object.assign({}, defaults, headers)
}

function random(arr): AxiosRequestHeaders {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getChromeHeaders(options): AxiosRequestHeaders {
  const { headers } = options
  headers['User-Agent'] = random(options['User-Agent'])
  return headers
}

function caseless(headers): object {
  const result = {}
  Object.keys(headers).forEach((key) => {
    result[key.toLowerCase()] = headers[key]
  })
  return result
}

export { getDefaultHeaders, caseless }
