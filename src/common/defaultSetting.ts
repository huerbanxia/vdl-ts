// 应用默认设置
const defaultSetting: common.AppSetting = {
  isSaveState: true,
  state: {
    width: 1280,
    height: 720
  },
  isOpenProxy: true,
  proxy: {
    protocol: 'http',
    host: '192.168.1.100',
    port: 1081
  },
  axios: {
    timeout: 5 * 1000,
    authorization: ''
  },
  download: {
    intervalTime: 4 * 1000,
    waitTime: 12 * 1000,
    failRetryNum: 5,
    maxTaskNum: 1,
    savePath: 'D:\\Download\\test'
  }
}
export default defaultSetting
