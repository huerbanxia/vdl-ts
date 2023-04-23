import { app, shell, BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import log from './utils/log'
import defaultSetting from '../common/defaultSetting'
import { saveSetting, setting } from './setting'
// import registerListener from './listener'
import registerListener from '@/main/listener/index'
import { dbo } from '@/main/db/db_operate'

// 全局异常处理
// process.on('uncaughtException', function (error) {
//   log.error(error.message)
// })

function createWindow(): void {
  log.debug('创建新窗口')
  const options: BrowserWindowConstructorOptions = {
    ...defaultSetting.state,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    // 隐藏标题栏
    titleBarStyle: 'hidden',
    // 显示标题栏按钮 且支持通过jsApi在渲染进程中进行修改 详见以下链接
    // https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#javascript-apis
    // https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#css-environment-variables
    titleBarOverlay: {
      color: '#38383f',
      symbolColor: '#74b1be',
      height: 30
    },
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

  // 判断是否需要代理
  if (setting.isOpenProxy) {
    const proxy = setting.proxy
    const proxyUrl = proxy.protocol + '://' + proxy.host + ':' + proxy.port
    mainWindow.webContents.session.setProxy({
      mode: 'fixed_servers',
      proxyRules: proxyUrl
    })
  }

  // 开发环境加载本地url 生产环境加载静态文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  // 注册主进程监听事件
  registerListener(mainWindow)
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
  // log.info('关闭数据库')
  dbo.exit()
  // 保存窗口状态数据
  saveSetting()
  if (process.platform !== 'darwin') {
    log.info('应用退出')
    app.quit()
  }
})
