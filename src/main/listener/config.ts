import { dbo } from '@/main/db/db_operate'
import { dbPath } from '@/main/db/db_path'
import { resetToDefault, saveSetting, setting } from '@/main/setting'
import { resetAxios } from '@/main/utils/http'
import log from '@/main/utils/log'
import { BrowserWindow, WebContents, ipcMain, session } from 'electron'
import fs from 'node:fs'
import { join } from 'node:path'

type AppSetting = common.AppSetting
type DataBaseInfo = common.params.DataBaseInfo

export const registerConfigListener = (wc: WebContents): void => {
  // 处理获取设置事件
  ipcMain.handle('on-get-setting', () => {
    return setting
  })

  // 处理保存设置事件
  ipcMain.handle('on-save-setting', (_event, userSetting: AppSetting): boolean => {
    saveSetting(userSetting)
    resetAxios()
    return true
  })

  // 处理保存设置事件
  ipcMain.handle('on-reset-setting', (): AppSetting => {
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
      // 给前端发送更新后的设置信息
      wc.send('update-setting', setting)
    }
  })

  // 获取数据库信息事件
  ipcMain.handle('on-get-database-info', (): common.params.DataBaseInfo => {
    const stats = fs.statSync(dbPath)
    const count = dbo.selectCount()
    const info: DataBaseInfo = {
      count: count,
      fileSize: stats.size
    }
    return info
  })

  ipcMain.handle('on-scan-dir', () => {
    const path = `Z:\\里\\待看\\iwara_爬取\\`
    fs.readdir(path, (err, files) => {
      if (err) {
        log.error(err)
        return
      }
      log.info(`获取到数据 ${files.length} 条`)

      for (let i = 0; i < files.length; i++) {
        const fileName = files[i]
        log.info(`当前处理第 ${i} 条 文件名${fileName}`)
        const split = fileName.split(' - ')
        const filePath = join(path, fileName)
        dbo.saveVideoDist({
          id: i.toString(),
          title: split[1],
          author: split[0],
          savePath: filePath
        })
      }
    })
  })
}
