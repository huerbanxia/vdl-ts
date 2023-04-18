import { resetToDefault, saveSetting, setting } from '@/main/setting'
import { resetAxios } from '@/main/utils/http'
import log from '@/main/utils/log'
import { BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'node:path'

export const registerConfigListener = (): void => {
  // 处理获取设置事件
  ipcMain.handle('on-get-setting', () => {
    return setting
  })

  // 处理保存设置事件
  ipcMain.handle('on-save-setting', (_event, userSetting: common.AppSetting): boolean => {
    saveSetting(userSetting)
    resetAxios()
    return true
  })

  // 处理保存设置事件
  ipcMain.handle('on-reset-setting', (): common.AppSetting => {
    resetToDefault()
    resetAxios()
    log.debug(setting)
    return setting
  })

  // 点击登录事件
  ipcMain.handle('on-login', () => {
    const loginWin = new BrowserWindow({
      width: 1280,
      height: 720,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/getData.js'),
        //共享session
        session: session.fromPartition('persist:session-iwara')
      }
    })
    // 判断是否需要代理
    if (setting.isOpenProxy) {
      const proxy = setting.proxy
      const proxyUrl = proxy.protocol + '://' + proxy.host + ':' + proxy.port
      loginWin.webContents.session.setProxy({
        mode: 'fixed_servers',
        proxyRules: proxyUrl
      })
    }
    loginWin.loadURL('https://www.iwara.tv/login')
  })

  // 更新Token配置
  ipcMain.handle('on-update-token', (_e, token: string) => {
    if (token && token !== setting.axios.authorization) {
      log.info('自动更新Token')
      setting.axios.authorization = token
    }
  })
}
