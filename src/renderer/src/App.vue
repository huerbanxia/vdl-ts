<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Home from './components/Home.vue'
import _ from 'lodash'
import useWinStore from './store/useWinStore'

const winstore = useWinStore()

// 重设组件大小
const winReSize = (): void => {
  // 存储到store
  winstore.setValues(window.innerWidth, window.innerHeight)
  // 修改主窗口的大小
  const mainContainer = document.getElementById('main-container')
  if (mainContainer) {
    mainContainer.style.height = window.innerHeight + 'px'
    mainContainer.style.width = window.innerWidth + 'px'
  }
}
// 组件创建添加窗口变化事件
onMounted(() => {
  winReSize()
  window.addEventListener('resize', _.debounce(winReSize, 5))
})
// 组件卸载移除监听
onUnmounted(() => {
  window.removeEventListener('resize', _.debounce(winReSize, 5))
})
</script>

<template>
  <div id="main-container" style="height: 720px">
    <Home></Home>
  </div>
</template>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}
html body {
  height: 100%;
}
body {
  overflow: hidden;
}
</style>
