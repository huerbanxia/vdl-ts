import { ipcMain, BrowserWindow, session } from 'electron'
import { join } from 'path'
import http from './utils/http'
import WorkerPool from './utils/worker_pool'
import { setting } from './setting'

const poolSize = setting.download.maxTaskNum
const pool = new WorkerPool(poolSize)

interface Params {
  subscribed?: boolean
  sort?: string
}

// 主进程监听器统一注册
export default function registerListtener(win): void {
  const wc = win.webContents

  ipcMain.handle('on-set-win-size', (width, height) => {
    if (width && height) {
      console.log()
    } else {
      console.log('重设窗口大小')
      win.resetWindowToDefault()
    }
  })

  ipcMain.handle('on-login', () => {
    const win = new BrowserWindow({
      width: 1280,
      height: 720,
      webPreferences: {
        // 不构建窗口只在内存中进行操作
        session: session.fromPartition('persist:session-iwara') //共享session
      }
    })
    win.webContents.session.setProxy({
      mode: 'fixed_servers',
      proxyRules: 'http://127.0.0.1:1081'
    })
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
    console.log(params)
    const res = await http.get('https://api.iwara.tv/videos?page=0&limit=24', { params })
    return res
  })

  ipcMain.handle('on-download-video', (_e, data) => {
    data.forEach((item) => {
      // https://www.iwara.tv/video/jUYUofGNEFJTgr/darling-dance-or-ninomae-inanis-pov
      const url = 'https://www.iwara.tv/video/' + item.id + '/' + item.slug
      const win = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        webPreferences: {
          preload: join(__dirname, '../preload/loadurl.js'),
          // 不构建窗口只在内存中进行操作
          offscreen: true,
          session: session.fromPartition('persist:session-iwara') //共享session
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
          callback({})
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
        }, 4000)
      })

      win.loadURL(url)
    })
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
