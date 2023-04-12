<!--
 * 左侧菜单栏组件
 * @author: zgy
 * @since: 2023-03-29
 * AsideMenu.vue
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Menu as IconMenu, Location, Expand, Fold, Sort } from '@element-plus/icons-vue'

import useTaskStore from '../store/useTaskStore'

const taskStore = useTaskStore()

const router = useRouter()
const isCollapse = ref(true)
const emit = defineEmits(['change-collapse'])

const changeCollapse = (): void => {
  isCollapse.value = !isCollapse.value
  emit('change-collapse', isCollapse.value)
}
onMounted(() => {
  // 初始化访问根路径
  router.push('/config')
  // 默认不折叠菜单
  isCollapse.value = false
})
const setWinSize = (): void => {
  window.api.setWinSize()
}
</script>
<template>
  <div class="container">
    <el-menu
      background-color="#222226"
      text-color="#fff"
      active-text-color="#fff"
      :collapse="isCollapse"
      style="height: auto"
    >
      <el-menu-item class="el-menu-item" @click="changeCollapse()">
        <el-icon v-if="isCollapse"><Expand /></el-icon>
        <el-icon v-if="!isCollapse"><Fold /></el-icon>
        <template #title> 菜单切换 </template>
      </el-menu-item>
    </el-menu>

    <el-menu
      background-color="#222226"
      text-color="#fff"
      active-text-color="#ffd04b"
      default-active="/config"
      :collapse="isCollapse"
      :router="true"
    >
      <el-menu-item index="/videoList">
        <el-icon><Document /></el-icon>
        <template #title> 视频列表 </template>
      </el-menu-item>
      <el-menu-item index="/taskList">
        <el-icon><Sort /></el-icon>
        <template #title>
          任务列表
          <span v-if="taskStore.doingTask.length > 0">
            {{ taskStore.doingTask.length }}
          </span>
        </template>
      </el-menu-item>
      <el-menu-item index="/config">
        <el-icon><IconMenu /></el-icon>
        <template #title>设置</template>
      </el-menu-item>
    </el-menu>

    <el-menu
      background-color="#222226"
      text-color="#fff"
      active-text-color="#fff"
      :collapse="isCollapse"
      style="height: auto"
    >
      <el-menu-item @click="setWinSize()">
        <el-icon><Location /></el-icon>
        <template #title> 重置窗口 </template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="less" scoped>
.el-menu {
  // height: 100vh;
  border: 0;
}
.change-menu {
  bottom: 0;
}
el-menu--collapse {
  width: 100%;
}
</style>
