import { app } from 'electron'

// 首先重设用户数据存储目录为当前运行目录
const userDataPath = app.getAppPath + '\\data\\'

const setUserDataPath = (): void => {
  app.setPath('userData', userDataPath)
}

export { userDataPath, setUserDataPath }
