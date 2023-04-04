import { app, shell, BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'
import log from 'electron-log'
import defaultSetting from '../common/defaultSetting'

// 数据仓库
const store = new Store()
// 全局设置
const setting = (store.get('setting') as global.app.AppSetting) || defaultSetting

function createWindow(): void {
  const options: BrowserWindowConstructorOptions = {
    ...defaultSetting,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  }
  if (setting.isSaveState) {
    options.width = setting.state.width
    options.height = setting.state.height
    options.x = setting.state.x
    options.y = setting.state.y
  }

  // 创建窗口
  const mainWindow = new BrowserWindow(options)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 当窗口完成调整大小后触发一次
  mainWindow.on('resized', () => {
    const size = mainWindow?.getSize()
    if (size) {
      setting.state.width = size[0]
      setting.state.height = size[1]
    }
  })

  // 当窗口移动到新位置时触发一次
  mainWindow.on('moved', () => {
    const postion = mainWindow?.getPosition()
    if (postion) {
      setting.state.x = postion[0]
      setting.state.y = postion[1]
    }
  })

  // 渲染进程中请求创建一个新窗口之前被调用 例如 window.open()， 带 target="_blank" 的链接，按shift 点击链接，或使用 <form target="_blank"> 提交一个表单
  mainWindow.webContents.setWindowOpenHandler((details) => {
    // 以桌面的默认方式打开给定的文件
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发环境加载本地url 生产环境加载静态文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  log.info('应用启动')
  // 为 windows 设置 model id
  electronApp.setAppUserModelId('com.electron')

  // 开发环境F12打开开发者工具 生产环境忽略 CommandOrControl + R 快捷键
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // 在 macOS 上 点击dock图标没有活动窗口的话创建新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当关闭所有窗口时退出应用 macOS 除外
app.on('window-all-closed', () => {
  store.set('setting', setting)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
