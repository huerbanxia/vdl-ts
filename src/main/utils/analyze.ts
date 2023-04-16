import { join } from 'node:path'
import { BrowserWindow, session } from 'electron'
import { setting } from '../setting'

export const analyzeDownloadUrl = (task: common.model.Task): void => {
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
  if (setting.isOpenProxy) {
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
