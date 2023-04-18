import defaultSetting from '@/common/defaultSetting'
import { setting } from '@/main/setting'
import log from '@/main/utils/log'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'

export const registerWinListener = (win: BrowserWindow): void => {
  // 处理打开保存窗口事件
  ipcMain.handle('on-open-save-dialog', async (): Promise<Electron.OpenDialogReturnValue> => {
    const saveFilePath = app.getAppPath() + '\\download\\'
    const result = await dialog.showOpenDialog({
      title: '选择保存位置',
      defaultPath: saveFilePath,
      properties: ['createDirectory', 'openDirectory']
    })
    return result
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
}
