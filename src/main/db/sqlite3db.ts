import sq3 from 'sqlite3'
import { app } from 'electron'
import fs from 'node:fs'
//  verbose 函数用于将执行模式设置为输出调用堆栈，也就是说，如果代码出错， 将会定位到具体的代码执行函数，而不仅仅只是提示错误信息，方便我们调试代码。
const sqlite3 = sq3.verbose()
// 创建数据库文件夹
const dbPath = app.getPath('userData') + '/db/'
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath)
}
// 初始化数据库到文件进行持久化
const db = new sqlite3.Database(dbPath + 'db3.db')
// serialize 指定操作串行执行
db.serialize(() => {
  db.run('create table test(name varchar(20))', () => {
    db.run("insert into test values('nihao')", () => {
      db.all('select * from test', (err, res) => {
        if (err) throw err
        console.log(JSON.stringify(res))
      })
    })
  })
})
export default db
