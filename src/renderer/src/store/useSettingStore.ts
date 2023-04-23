import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { ElMessage } from 'element-plus'

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
        isOpenProxy: false,
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
          intervalTime: 4 * 1000,
          waitTime: 12 * 1000,
          failRetryNum: 0,
          maxTaskNum: 1,
          savePath: 'D:\\Download\\test'
        }
      }
    }
  },
  actions: {
    init(config?: common.AppSetting) {
      if (config) {
        this.setting = config
        return
      }
      window.api.getSetting().then((setting: common.AppSetting) => {
        this.setting = setting
      })
    },
    saveSetting(userSetting: common.AppSetting) {
      this.setting = userSetting
      window.api.saveSetting(toRaw(this.setting)).then((res) => {
        console.log(res)
        ElMessage.success('设置已保存')
      })
    },
    resetSetting() {
      window.api.resetSetting().then((setting: common.AppSetting) => {
        this.setting = setting
        console.log(setting)
        ElMessage.success('所有设置已重置')
      })
    }
  }
})

export default useSettingStore
