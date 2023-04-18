import log, { LevelOption } from 'electron-log'
import { useEnv } from '@/common/env'

// 设置为在终端环境中运行
process.stdout.isTTY = useEnv(import.meta.env.MAIN_VITE_PROCESS_STDOUT_TTY) as boolean
// 使用样式
log.transports.console.useStyles = useEnv(
  import.meta.env.MAIN_VITE_LOG_CONSOLE_USESTYLES
) as boolean
// 日志控制台等级
log.transports.console.level = useEnv(import.meta.env.MAIN_VITE_LOG_CONSOLE_LEVEL) as LevelOption
// 日志控制台格式化
log.transports.console.format = import.meta.env.MAIN_VITE_LOG_CONSOLE_FORMAT
// 日志文件等级
log.transports.file.level = useEnv(import.meta.env.MAIN_VITE_LOG_FILE_LEVEL) as LevelOption

// 日志文件等级，level, default 'silly'
// log.transports.file.level = is.dev ? false : 'info'

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
