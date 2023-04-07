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

interface Params {
  subscribed?: boolean
  sort?: string
}

// 主进程监听器统一注册
export default function registerListtener(win: BrowserWindow): void {
  const wc = win.webContents
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
    log.info(params)
    const res = await http.get('https://api.iwara.tv/videos?page=0&limit=24', { params })
    return res
  })

  const analyzeDownloadUrl = (item: common.params.IDownloadParam): void => {
    const url = 'https://www.iwara.tv/video/' + item.id + '/' + item.slug
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
        win.webContents.send('on-did-finish-load', item)
        // 延时一秒关闭窗口
        setTimeout(() => {
          win.close()
        }, 1000)
      }, setting.download.waitTime)
    })

    win.loadURL(url)
  }

  ipcMain.handle('on-download-video', (_e, data) => {
    analyzeDownloadUrl(data)
  })

  ipcMain.handle('on-download-videos', (_e, data) => {
    data.forEach((item: common.params.IDownloadParam) => analyzeDownloadUrl(item))
  })

  // event.sender.send 返回的消息必须用 on 监听
  ipcMain.on('on-return-info-list', (e, data) => {
    e.sender.send('show-msg', 'success', '下载信息解析成功 开始下载')
    console.log('接收到下载信息 开始下载', data.list.length)
    pool.runTask({ data }, (_err, result) => {
      const res = {
        id: data.id,
        process: result.process,
        status: result.status
      }
      if (result.status) {
        wc.send('update-process', res)
      } else {
        wc.send('update-process', res)
        e.sender.send('show-msg', 'error', '下载失败')
      }
    })
  })

  ipcMain.handle('on-test-pool', (_e, data) => {
    console.log(data)
  })
}
