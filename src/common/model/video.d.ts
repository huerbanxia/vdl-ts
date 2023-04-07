declare namespace common {
  declare namespace model {
    interface Video {
      id: string
      title: string
      slug: string
      process: number
      status: boolean
      createdAt: string
      createdAtFormat: string
      user: User
      file: File
    }
  }
}
