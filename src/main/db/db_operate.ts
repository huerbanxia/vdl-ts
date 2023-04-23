// import db from './sqlite3db'
// import { Database } from 'sqlite3'
import { dbInstance } from './better_sqlite3'
import BetterSqlite3 from 'better-sqlite3'
import log from 'electron-log'

const createTableVideoSql = `CREATE TABLE if not exists "video" (
  "id" text NOT NULL,
  "title" text,
  "slug" text,
  "createdAt" text,
  "size" integer,
  "source" text,
  "isSaved" integer,
  "savePath" text,
  "isDeleted" integer,
  PRIMARY KEY ("id")
);`

const insertSql = `INSERT INTO video ( id, title, slug, createdAt, size, isSaved, isDeleted)
VALUES
  (  @id, @title, @slug, @createdAt, @size, @isSaved, @isDeleted)`

const insertSqlDist = `INSERT INTO video_dist ( id, title, author, savePath)
VALUES
  (  @id, @title, @author, @savePath)`

interface Options {
  isInited?: boolean
}

interface selectCountRes {
  count: number
}

type VideoData = common.model.VideoData

export class DbOperate {
  db: BetterSqlite3.Database
  insert: BetterSqlite3.Statement

  constructor(options?: Options) {
    this.db = dbInstance
    if (options?.isInited) {
      this.initTable()
    }
    this.insert = this.db.prepare(insertSql)
  }

  initTable(): void {
    this.db.exec(createTableVideoSql)
  }

  selectId(ids: string[]): Array<VideoData> {
    const sql = `SELECT id , isSaved , isDeleted FROM video WHERE id in (${ids.map((id) => {
      return `'${id}'`
    })})`
    const stmt = this.db.prepare(sql)
    const videos = stmt.all() as VideoData[]
    log.debug(videos)
    return videos
  }

  saveVideoList(videos: Array<VideoData>): void {
    if (videos.length > 0) {
      //创建事务
      const insertTransaction = this.db.transaction((list) => {
        for (const video of list) this.insert.run(video)
      })
      insertTransaction(videos)
    }
  }
  saveVideo(video: VideoData): void {
    this.insert.run(video)
  }

  saveVideoDist(data): void {
    const stmt = this.db.prepare(insertSqlDist)
    stmt.run(data)
  }

  updateVideo(videoId: string, savePath: string): void {
    const updateStmt = this.db.prepare(
      `UPDATE video SET savePath =@savePath, isSaved=1 WHERE id=@id`
    )
    updateStmt.run({ id: videoId, savePath: savePath })
  }

  selectCount(): number {
    const selectCountStmt = this.db.prepare(`select count(id) as count from video`)
    const result = selectCountStmt.get() as selectCountRes
    return result.count
  }

  exit(): void {
    this.db.close()
  }
}

const dbo = new DbOperate({ isInited: true })

export { dbo }
