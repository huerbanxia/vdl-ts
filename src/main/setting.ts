import defaultSetting from '../common/defaultSetting'
import Store from 'electron-store'
import log from './utils/log'
import _ from 'lodash'
// 数据仓库文件名
const store = new Store({ name: 'vdl-config' })
// 全局设置
let setting: common.AppSetting = _.cloneDeep(defaultSetting)
_.merge(setting, store.get('setting') as common.AppSetting)

const saveSetting = (userSetting?: common.AppSetting): void => {
  log.info('保存设置')
  _.merge(setting, userSetting)
  store.set('setting', setting)
}

const resetToDefault = (): void => {
  log.info('重置设置')
  setting = _.cloneDeep(defaultSetting)
  store.set('setting', setting)
}

export { setting, saveSetting, resetToDefault }
