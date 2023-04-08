declare namespace common {
  interface AppSetting {
    // 是否保存窗口状态
    isSaveState: boolean
    // 具体状态值
    state: {
      // 窗口宽度
      width: number
      // 窗口高度
      height: number
      //
      x?: number
      y?: number
    }
    // 代理设置
    proxy?: {
      // 协议
      protocol: string
      // 主机
      host: string
      // 端口号
      port: number
    }
    // 下载设置
    download: {
      // 每几秒钟发送一个任务到解析线程
      intervalTime: number
      // 解析下载链接等待时间
      waitTime: number
      // 同时下载任务数
      maxTaskNum: number
      // 下载路径
      savePath: string
    }
    axios: {
      // token
      authorization?: string
      // 请求超时时间（单位毫秒 1秒=1000毫秒） 默认值 5000
      timeout: number
    }
  }
}
