import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface ICallbackInterface {
  (event: IpcRendererEvent, data: object): void
}

// Custom APIs for renderer
const api = {
  // 主进程发送全局信息展示
  showMessage(callback: ICallbackInterface): void {
    ipcRenderer.on('show-msg', callback)
  },
  // 设置窗口大小
  setWinSize(width: number, height: number): void {
    ipcRenderer.invoke('on-set-win-size', width, height)
  },
  // 获取视频列表
  async getVideoPageList(params: object): Promise<object> {
    const res = ipcRenderer.invoke('on-get-video-page-list', params)
    return res
  },
  // 加载url
  loadUrl(url: string): void {
    ipcRenderer.invoke('on-load-url', url)
  },
  // 下载视频
  downloadVideo(data: common.model.Task): void {
    ipcRenderer.invoke('on-download-video', data)
  },
  // 更新下载进度条
  updateProcess(callback: ICallbackInterface): void {
    ipcRenderer.on('update-process', callback)
  },
  // 手动登录
  login(): void {
    ipcRenderer.invoke('on-login')
  },
  getSetting(): Promise<common.AppSetting> {
    return ipcRenderer.invoke('on-get-setting')
  },
  saveSetting(setting: common.AppSetting): Promise<boolean> {
    return ipcRenderer.invoke('on-save-setting', setting)
  },
  resetSetting(): Promise<common.AppSetting> {
    return ipcRenderer.invoke('on-reset-setting')
  },
  openSaveDialog(): Promise<Electron.OpenDialogReturnValue> {
    return ipcRenderer.invoke('on-open-save-dialog')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
