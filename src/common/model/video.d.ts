declare namespace common {
  declare namespace model {
    class Video {
      id: string
      title: string
      slug: string
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
    }

    class VideoData extends Video {
      size?: number
      isSaved: number
      fileId?: string
    }
  }
}
