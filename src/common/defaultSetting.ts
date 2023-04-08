// 应用默认设置
const defaultSetting: common.AppSetting = {
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
    authorization:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJjNDI1ODNhLTI5NGQtNDI1Ny04ZGZmLTMzMDc0MDljNjc5ZCIsInR5cGUiOiJyZWZyZXNoX3Rva2VuIiwiaXNzIjoiaXdhcmEiLCJpYXQiOjE2ODAyNjcwODEsImV4cCI6MTY4Mjg1OTA4MX0.8cn1GGJkOAmaI6DMr7RnGgWR0LeJ_G_XcIuGVcW4Owk'
  },
  download: {
    waitTime: 12 * 1000,
    maxTaskNum: 1,
    savePath: 'D:\\Download\\test'
  }
}
export default defaultSetting
