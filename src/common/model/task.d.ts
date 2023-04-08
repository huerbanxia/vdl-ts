declare namespace common {
  declare namespace model {
    interface Task {
      // 任务id
      id: string
      // 视频id
      videoId: string
      // 文件id
      fileId: string
      // title
      title: string
      // 去除特殊字符后的title
      titleFormat: string
      // 标题别名
      slug: string
      // 作者
      author: string
      // 文件大小
      size: number
      // 格式化后文件大小
      sizeFormat: string
      // 进度 0-100
      process: number
      // 文件下载状态 0 等待中 1 正在下载 2 已完成
      status: string
      // 下载链接数据
      list?: DownloadData[]
    }
  }
}
