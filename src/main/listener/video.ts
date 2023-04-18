import { DbOperate } from '@/main/db/db_operate'
import { setting } from '@/main/setting'
import { analyzeDownloadUrl } from '@/main/utils/analyze'
import { http } from '@/main/utils/http'
import log from '@/main/utils/log'
import WorkerPool from '@/main/utils/worker_pool'
import { WebContents, ipcMain, shell } from 'electron'

interface Params {
  subscribed?: boolean
  sort?: string
  rating?: string
  page?: number
  limit?: number
}

// 初始化下载线程池
const pool = new WorkerPool(setting.download.maxTaskNum)

export const registerVideoListener = (wc: WebContents, dbo: DbOperate): void => {
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
    const res: common.params.VideoResults = await http.get('https://api.iwara.tv/videos', {
      params
    })
    const idList: string[] = res.results.map((item) => {
      return item.id
    })
    // 查询数据库数据id
    const ids = dbo.selectId(idList)
    const insertData: Array<common.model.VideoData> = []
    res.results.forEach((item) => {
      if (ids.includes(item.id)) {
        item.isData = true
      } else {
        item.isData = false
        const videoData: common.model.VideoData = {
          ...item,
          size: item.file?.size,
          fileId: item.file?.id,
          isSaved: 0
        }
        insertData.push(videoData)
      }
    })
    dbo.saveVideoList(insertData)
    return res
  })

  ipcMain.handle('on-download-video', (_e, data: common.model.Task) => {
    log.info(`接收到消息`, data.titleFormat)
    analyzeDownloadUrl(data)
  })

  // 监听解析失败事件 再次解析
  ipcMain.on('on-download-video', (_event, data: common.model.Task) => {
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
  ipcMain.on('on-return-info-list', (_event, data: common.model.Task) => {
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
      }
    })
  })

  // 打开文件或文件夹
  ipcMain.handle('on-open-path', (_event, path: string): Promise<string> => {
    return shell.openPath(path)
  })
}
