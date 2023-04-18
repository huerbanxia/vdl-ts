/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 是否在终端环境中运行
  readonly MAIN_VITE_PROCESS_STDOUT_TTY: boolean
  // 日志 控制台日志等级
  readonly MAIN_VITE_LOG_CONSOLE_LEVEL: LevelOption
  // 日志使用颜色样式
  readonly MAIN_VITE_LOG_CONSOLE_USESTYLES: boolean
  // 日志 控制台格式
  readonly MAIN_VITE_LOG_CONSOLE_FORMAT: string
  // 日志 文件 日志等级
  readonly MAIN_VITE_LOG_FILE_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
