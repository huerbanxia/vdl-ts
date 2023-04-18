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
  "createdAtFormat" text,
  "size" integer,
  "source" text,
  "isSaved" integer,
  "savePath" text,
  "isDeleted" integer,
  PRIMARY KEY ("id")
);`

const insertSql = `INSERT INTO video ( id, title, slug, createdAt, size )
VALUES
  (  @id, @title, @slug, @createdAt, @size )`

interface Options {
  isInited?: boolean
}

export class DbOperate {
  db: BetterSqlite3.Database
  insert: BetterSqlite3.Statement

  constructor(options?: Options) {
    this.db = dbInstance
    this.insert = this.db.prepare(insertSql)
    if (options?.isInited) {
      this.initTable()
    }
  }

  initTable(): void {
    this.db.exec(createTableVideoSql)
  }

  selectId(ids: string[]): string[] {
    const sql = `SELECT id FROM video WHERE id in (${ids.map((id) => {
      return `'${id}'`
    })})`
    const stmt = this.db.prepare(sql)
    const videos = stmt.all() as common.model.VideoData[]
    const videoIds = videos.map((item) => {
      return item.id
    })
    log.debug(videoIds)
    return videoIds
  }

  saveVideoList(videos: Array<common.model.VideoData>): void {
    if (videos.length > 0) {
      //创建事务
      const insertTransaction = this.db.transaction((list) => {
        for (const video of list) this.insert.run(video)
      })
      insertTransaction(videos)
    }
  }
  saveVideo(video: common.model.VideoData): void {
    this.insert.run(video)
  }

  exit(): void {
    this.db.close()
  }
}
