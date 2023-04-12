import { defineStore } from 'pinia'

// 窗口信息仓库
const useWinStore = defineStore('winStore', {
  state: () => {
    return {
      width: 0,
      height: 0
    }
  },
  // 开启持久化存储
  persist: true,
  getters: {
    tableHeight(state) {
      const temp = state.height - 150
      return temp
    }
  },
  actions: {
    setValues(width: number, height: number) {
      this.width = width
      this.height = height
    }
  }
})

export default useWinStore
