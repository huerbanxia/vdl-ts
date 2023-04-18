import BetterSqlite3 from 'better-sqlite3'
import { dbPath } from './db_path'
import log from 'electron-log'
// verbose 提供一个函数，该函数在数据库连接执行的每个SQL字符串时都会被调用
const dbInstance: BetterSqlite3.Database = new BetterSqlite3(dbPath, { verbose: log.debug })
// WAL日志模式
// WAL（Write-Ahead Logging）日志模式是SQLite在3.7.0版本上新增的日志模式，用于提高数据库的并发性
// 在大多数情况下，WAL速度更快
// 使用数据库的所有进程必须位于同一台主机上; WAL无法在网络文件系统上运行
dbInstance.pragma('journal_mode = WAL') // 非必须

export { dbInstance }
