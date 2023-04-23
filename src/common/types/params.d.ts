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
      savePath: string
    }

    interface VideoResults {
      count: number
      limit: number
      page: number
      results: Array<common.model.Video>
    }

    interface DataBaseInfo {
      // 数据量
      count: number
      // 数据库文件大小
      fileSize: number
    }
  }
}
