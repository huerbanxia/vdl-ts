declare namespace common {
  declare namespace model {
    interface Task {
      // 任务id
      id: string
      // 文件名
      filename: string
      // 文件大小
      size: string
      // 进度 0-100
      process: number
      // 文件下载状态 0 等待中 1 正在下载 2 已完成
      status: string
    }
  }
}
