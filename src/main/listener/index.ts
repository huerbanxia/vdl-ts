import { BrowserWindow } from 'electron'
import { DbOperate } from '@/main/db/db_operate'
import { registerConfigListener } from './config'
import { registerVideoListener } from './video'
import { registerWinListener } from './win'

/**
 * 注册各类事件监听
 * @param win 主窗口对象
 * @param dbo 数据库操作对象
 */
export default function registerListener(win: BrowserWindow, dbo: DbOperate): void {
  // 设置相关事件
  registerConfigListener(win.webContents)

  // 窗口相关事件
  registerWinListener(win)

  // 视频信息相关事件
  registerVideoListener(win.webContents, dbo)
}
