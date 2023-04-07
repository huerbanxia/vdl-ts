import defaultSetting from '../common/defaultSetting'
import Store from 'electron-store'
import log from 'electron-log'
// 数据仓库
const store = new Store()
// 全局设置
// const setting: global.app.AppSetting =
//   (store.get('setting') as global.app.AppSetting) || defaultSetting
const setting: common.AppSetting = {
  ...defaultSetting,
  ...(store.get('setting') as common.AppSetting)
}

const saveSetting = (): void => {
  log.info('保存设置')
  store.set('setting', setting)
}

export { setting, saveSetting }
