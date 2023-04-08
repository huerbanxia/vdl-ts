import { ipcMain, BrowserWindow, session } from 'electron'
import { join } from 'path'
import http from './utils/http'
import WorkerPool from './utils/worker_pool'
import { setting } from './setting'
import defaultSetting from '../common/defaultSetting'
import log from 'electron-log'

// 初始化下载线程池
const poolSize = setting.download.maxTaskNum
const pool = new WorkerPool(poolSize)

pool.on('error', (error) => {
  log.error(error)
})

interface Params {
  subscribed?: boolean
  sort?: string
  page?: number
  limit?: number
}

// 主进程监听器统一注册
export default function registerListtener(win: BrowserWindow): void {
  const wc = win.webContents
  // 处理获取设置事件
  ipcMain.handle('on-get-setting', () => {
    return setting
  })

  // 处理指定窗口大小事件
  ipcMain.handle('on-set-win-size', (_event, width, height) => {
    if (!width || !height) {
      width = defaultSetting.state.width
      height = defaultSetting.state.height
    }
    log.info(`重设窗口大小为 ${width}x${height}`)
    // 设置为默认大小
    win.setSize(width, height)
    // 保存状态
    setting.state.width = defaultSetting.state.width
    setting.state.height = defaultSetting.state.height
  })

  ipcMain.handle('on-login', () => {
    const win = new BrowserWindow({
      width: 1280,
      height: 720,
      autoHideMenuBar: true,
      webPreferences: {
        //共享session
        session: session.fromPartition('persist:session-iwara')
      }
    })
    // 判断是否需要代理
    if (setting.proxy) {
      const proxy = setting.proxy
      const proxyUrl = proxy.protocol + '://' + proxy.host + ':' + proxy.port
      win.webContents.session.setProxy({
        mode: 'fixed_servers',
        proxyRules: proxyUrl
      })
    }
    win.loadURL('https://www.iwara.tv/login')
  })

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
    params.page = data.currentPage - 1
    params.limit = data.pageSize
    log.info(`获取视频列表 参数 `)
    log.info(params)
    const res = await http.get('https://api.iwara.tv/videos', { params })
    return res
  })

  const analyzeDownloadUrl = (task: common.model.Task): void => {
    const url = 'https://www.iwara.tv/video/' + task.videoId + '/' + task.slug
    const win = new BrowserWindow({
      width: 1280,
      height: 720,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/loadurl.js'),
        // 不构建窗口只在内存中进行操作
        offscreen: true,
        //共享session
        session: session.fromPartition('persist:session-iwara')
      }
    })
    // win.webContents.openDevTools()
    // 判断是否需要代理
    if (setting.proxy) {
      const proxy = setting.proxy
      const proxyUrl = proxy.protocol + '://' + proxy.host + ':' + proxy.port
      win.webContents.session.setProxy({
        mode: 'fixed_servers',
        proxyRules: proxyUrl
      })
    }
    const filter = {
      urls: ['<all_urls>']
    }
    win.webContents.session.webRequest.onBeforeRequest(filter, (details, callback) => {
      // console.log('url', details.url)
      // console.log('resourceType', details.resourceType)
      // 拦截图片资源和css 加快渲染速度
      if (details.resourceType === 'image' || details.resourceType === 'stylesheet') {
        callback({ cancel: true })
      } else {
        callback({ cancel: false })
      }
    })
    /**
     * 等待页面基本元素加载完成后
     * 延时等待所有元素加载完成后再进行下载链接的读取
     * 否则读取不到数据
     * 这个可能是i站为放爬取设置了固定的延时
     */
    win.webContents.on('did-finish-load', () => {
      setTimeout(() => {
        win.webContents.send('on-did-finish-load', task)
        // 延时一秒关闭窗口
        setTimeout(() => {
          win.close()
        }, 4000)
      }, setting.download.waitTime)
    })
    win.loadURL(url)
  }

  ipcMain.handle('on-download-video', (_e, data: common.model.Task) => {
    log.info(`接收到消息`, data.titleFormat)
    analyzeDownloadUrl(data)
  })

  // 监听解析失败事件 再次解析
  ipcMain.on('on-download-video', (_event, data: common.model.Task) => {
    log.info(`接收到失败消息 ${data.titleFormat} 当前重试次数${data.retryNum}`)
    if (data.retryNum < 2) {
      log.info(`再次尝试解析 ${data.titleFormat}`)
      analyzeDownloadUrl(data)
    } else {
      log.info(`放弃解析 ${data.titleFormat}`)
    }
  })

  // event.sender.send 返回的消息必须用 on 监听
  ipcMain.on('on-return-info-list', (_event, data: common.model.Task) => {
    log.info('接收到下载信息 创建下载任务', data.list?.length)
    // 更新任务显示状态到 等待下载
    wc.send('update-process', { taskId: data.id, process: 0, status: '1' })
    // 添加下载任务
    pool.runTask({ data }, (_err, result) => {
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

  ipcMain.handle('on-test-pool', (_e, data) => {
    console.log(data)
  })
}
