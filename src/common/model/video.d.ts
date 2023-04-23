declare namespace common {
  declare namespace model {
    interface TagData {
      id: string
      type: string
    }
    /**
     * 请求接口返回的视频对象
     */
    class Video {
      id: string
      title: string
      slug: string
      numLikes: number
      numViews: number
      process: number
      status: boolean
      createdAt: string
      createdAtFormat: string
      user: User
      file: File
      sizeFormat: string
      source: string
      imgUrl: string
      previewSrcList: string[]
      isCheck: boolean
      isAutoplay: boolean
      tags: Array<TagData>
      // 是否为第一次出现的数据 true 数据库中无此数据
      isFirst: boolean
      isSaved: boolean
      isDeleted: boolean
    }

    /**
     * 用来插入数据库的对象
     */
    class VideoData extends Video {
      size?: number
      isSaved: number
      isDeleted: number
      fileId?: string
    }
  }
}
