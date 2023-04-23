import { dbo } from '@/main/db/db_operate'
import { setting } from '@/main/setting'
import { analyzeDownloadUrl } from '@/main/utils/analyze'
import { http } from '@/main/utils/http'
import log from '@/main/utils/log'
import WorkerPool from '@/main/utils/worker_pool'
import { WebContents, ipcMain, shell } from 'electron'
import _ from 'lodash'
import fs from 'node:fs'

interface Params {
  subscribed?: boolean
  sort?: string
  rating?: string
  page?: number
  limit?: number
}

type VideoData = common.model.VideoData
type VideoResults = common.params.VideoResults
type Task = common.model.Task

// 初始化下载线程池
const pool = new WorkerPool(setting.download.maxTaskNum)

export const registerVideoListener = (wc: WebContents): void => {
  /**
   * 处理获取视频列表事件
   */
  ipcMain.handle('on-get-video-page-list', async (_e, data) => {
    // 获取 token 接口 https://api.iwara.tv/user/token
    // let res = await http.get('https://api.iwara.tv/videos?sort=date&rating=all')
    // https://api.iwara.tv/search?type=video&query=hello&page=0

    const params: Params = {}
    if (data.isSubscribed === '1') {
      params.subscribed = true
    } else {
      params.sort = data.sort
    }
    // params.rating = 'all'
    params.page = data.currentPage - 1
    params.limit = data.pageSize
    const res: VideoResults = await http.get('https://api.iwara.tv/videos', {
      params
    })
    const idList: string[] = res.results.map((item) => {
      return item.id
    })
    // 查询数据库数据id
    const videos = dbo.selectId(idList)
    const insertData: Array<VideoData> = getInsertData(res, videos)
    dbo.saveVideoList(insertData)
    return res
  })

  ipcMain.handle('on-download-video', (_e, data: Task) => {
    log.info(`接收到消息`, data.titleFormat)
    analyzeDownloadUrl(data)
  })

  // 监听解析失败事件 再次解析
  ipcMain.on('on-download-video', (_event, data: Task) => {
    log.info(`接收到失败消息 ${data.titleFormat} 当前重试次数${data.retryNum}`)
    if (data.retryNum < setting.download.failRetryNum) {
      log.info(`再次尝试解析 ${data.titleFormat}`)
      analyzeDownloadUrl(data)
    } else {
      log.info(`放弃解析 ${data.titleFormat}`)
      // 更新任务列表状态 解析失败
      const res = {
        taskId: data.id,
        process: data.process,
        status: '-1'
      }
      wc.send('update-process', res)
    }
  })

  // 接收到下载信息后进行处理
  // event.sender.send 返回的消息必须用 on 监听
  ipcMain.on('on-return-info-list', (_event, data: Task) => {
    log.info('接收到下载信息 创建下载任务', data.list?.length)
    // 更新任务显示状态到 等待下载
    wc.send('update-process', { taskId: data.id, process: 0, status: '1' })
    // 添加下载任务
    pool.runTask({ data, setting }, (_err, result) => {
      if (result) {
        const res = {
          taskId: result.taskId,
          process: result.process,
          status: result.status,
          savePath: result.savePath
        }
        wc.send('update-process', res)
        // 更新数据库
        if (result.over) {
          dbo.updateVideo(result.videoId, result.savePath)
        }
      }
    })
  })

  // 打开文件或文件夹
  ipcMain.handle('on-open-path', (_event, path: string): Promise<string> => {
    if (!fs.existsSync(path)) {
      // 递归创建目录
      fs.mkdirSync(path, { recursive: true })
    }
    return shell.openPath(path)
  })
}
/**
 * 处理接口返回数据成要插入数据库的格式
 * @param res 接口返回的数据
 * @param videos 数据库查询到的数据
 * @returns 要插入数据库的数据
 */
function getInsertData(res: VideoResults, videos: VideoData[]): Array<VideoData> {
  const videoIds = videos.map((item) => {
    return item.id
  })
  const insertData: Array<VideoData> = []
  res.results.forEach((item) => {
    // 判断数据库中是否存在数据
    if (videoIds.includes(item.id)) {
      item.isFirst = false
      const video = _.find(videos, { id: item.id })
      item.isSaved = video?.isSaved === 1
      item.isDeleted = video?.isDeleted === 1
    } else {
      item.isFirst = true
      item.isSaved = false
      item.isDeleted = false
      const videoData: VideoData = {
        ...item,
        size: item.file?.size,
        fileId: item.file?.id,
        isSaved: 0,
        isDeleted: 0
      }
      insertData.push(videoData)
    }
  })
  return insertData
}
