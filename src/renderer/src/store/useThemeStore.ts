import { defineStore } from 'pinia'

// 窗口信息仓库
const useThemeStore = defineStore('themeStore', {
  state: () => {
    return {
      isDark: false
    }
  },
  actions: {
    setDark(isDark: boolean) {
      this.isDark = isDark
    }
  }
})

export default useThemeStore
