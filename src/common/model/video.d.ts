declare namespace common {
  declare namespace model {
    interface TagData {
      id: string
      type: string
    }
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
      isData: boolean
      tags: Array<TagData>
    }

    class VideoData extends Video {
      size?: number
      isSaved: number
      fileId?: string
    }
  }
}
