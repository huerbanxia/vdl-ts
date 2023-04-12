import { parentPort } from 'worker_threads'
import fs from 'fs'
import { http } from './http'
import { AxiosResponse } from 'axios'
import _ from 'lodash'
import { resolve } from 'path'
import { setting } from '../setting'
import log from 'electron-log'
import { Stream } from 'stream'

parentPort?.on('message', (task) => {
  const data: common.model.Task = task.data
  // log.info(data)
  const filepath = setting.download!.savePath ?? __dirname
  if (!fs.existsSync(filepath)) {
    log.info(`下载路径不存在 自动创建 ${filepath}`)
    fs.mkdirSync(filepath)
  }
  let video = _.find(data.list, { type: 'Source' })
  if (!video) {
    video = _.find(data.list, { type: '540' })
    if (!video) {
      video = _.find(data.list, { type: '360' })
      if (!video) {
        video = data.list![0]
      }
    }
  }
  // 文件名 作者+标题+清晰度+视频id+后缀
  const fileName =
    data.author + ' - ' + data.titleFormat + ' [' + video.type + '] [' + data.videoId + ']'
  const tempPath = resolve(filepath, fileName + '.temp')
  const realPath = resolve(filepath, fileName + '.mp4')
  let statusCode = '2'
  http
    .get(video.url, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        // const process = Math.round((progressEvent.loaded / progressEvent.total!) * 100)
        const process: string = ((progressEvent.loaded / progressEvent.total!) * 100).toFixed(2)
        // 将下载进度返回给回调函数
        if (progressEvent.loaded === progressEvent.total) {
          statusCode = '3'
        }
        const result = {
          taskId: data.id,
          status: statusCode,
          process
        }
        parentPort?.postMessage(result)
      }
    })
    .then((res: AxiosResponse) => {
      const stream: Stream = res.data
      stream.on('end', () => {
        fs.renameSync(tempPath, realPath)
        log.info(`下载完成 ${realPath}`)
        const result = {
          over: true,
          taskId: data.id,
          status: '3',
          process: '100.00',
          savePath: realPath
        }
        parentPort?.postMessage(result)
      })
      const writer = fs.createWriteStream(tempPath)
      stream.pipe(writer)
    })
    .catch((error) => {
      statusCode = '-2'
      const result = {
        taskId: data.id,
        status: statusCode,
        process
      }
      parentPort?.postMessage(result)
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath)
      }
      log.info(`下载失败 ${error}`)
    })
})
