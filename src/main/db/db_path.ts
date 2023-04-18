import { app } from 'electron'
import fs from 'node:fs'

// 创建数据库文件夹
const dbPathDir = app.getPath('userData') + '/db/'
if (!fs.existsSync(dbPathDir)) {
  fs.mkdirSync(dbPathDir)
}
const dbPath = dbPathDir + 'db3.db'
export { dbPath }
