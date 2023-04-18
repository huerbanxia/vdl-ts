import { is } from '@electron-toolkit/utils'
import log from 'electron-log'

// 开发环境控制台样式配置
if (is.dev) {
  // 判断它是否在终端（terminal）终端环境中执行 指定为true
  process.stdout.isTTY = true
  // 使用样式
  log.transports.console.useStyles = true
  // 日志控制台等级，默认值：false
  log.transports.console.level = 'debug'
  // 日志控制台格式化
  log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
}
// 日志文件等级，level, default 'silly'
log.transports.file.level = is.dev ? 'debug' : 'info'

// log.info('%cRed text. %cGreen text', 'color: red', 'color: green')

// 日志文件名，默认：main.log
// log.transports.file.fileName = 'main.log'
// 日志格式，默认：[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}
// log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
// 日志大小，默认：1048576（1M），达到最大上限后，备份文件并重命名为：main.old.log，有且仅有一个备份文件
// log.transports.file.maxSize = 1048576
// 日志文件位置：C:\Users\%USERPROFILE%\AppData\Roaming\Electron\logs
// 完整的日志路径：log.transports.file.file，优先级高于 appName、fileName

// log.error('Hello, log error')
// log.warn('Hello, log warn')
// log.info('Hello, log info')
// log.verbose('Hello, log verbose')
// log.debug('Hello, log debug')
// log.silly('Hello, log silly')
// log.info('中文')

export default log
