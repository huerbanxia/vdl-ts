import { defineStore } from 'pinia'

interface ISettingState {
  setting: common.AppSetting
}

// 窗口信息仓库
const useSettingStore = defineStore('settingStore', {
  state: (): ISettingState => {
    return {
      setting: {
        isSaveState: true,
        state: {
          width: 1280,
          height: 720
        },
        proxy: {
          protocol: 'http',
          host: '127.0.0.1',
          port: 1081
        },
        axios: {
          timeout: 10 * 1000,
          authorization: ''
        },
        download: {
          waitTime: 12 * 1000,
          maxTaskNum: 1,
          savePath: 'D:\\Download\\test'
        }
      }
    }
  },
  actions: {
    init() {
      window.api.getSetting().then((setting: common.AppSetting) => {
        this.setting = setting
      })
    }
  }
})

export default useSettingStore
