import { ipcRenderer } from 'electron'
const token = localStorage.getItem('token')
ipcRenderer.invoke('on-update-token', token)
