import { ipcRenderer } from 'electron'

ipcRenderer.on('on-did-finish-load', (event, videoData) => {
  console.log('开始解析下载链接')
  const downloadDom = document.querySelectorAll('.dropdown__content')[2]
  console.log(downloadDom)
  const liList = downloadDom.childNodes[0].childNodes
  const data = { ...videoData, list: [] }
  liList.forEach((item) => {
    const aDom = item.firstChild
    if (aDom) {
      const info = {
        id: videoData.id,
        downloadUrl: (aDom as HTMLAnchorElement).href,
        type: (aDom as HTMLAnchorElement).innerText
      }
      data.list.push(info)
    }
  })
  console.log('解析到数据 ' + data.list.length + ' 条')
  event.sender.send('on-return-info-list', data)
})
