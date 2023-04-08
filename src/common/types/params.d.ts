declare namespace common {
  declare namespace params {
    interface IDownloadParam {
      id: string
      title: string
      slug: string
      author: string
      fileId: string
      createdAt: string
    }

    interface IUpdateProcessParam {
      // 要更新的任务id
      taskId: string
      process: number
      status: string
    }
  }
}
