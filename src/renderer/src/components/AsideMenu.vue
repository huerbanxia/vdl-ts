<!--
 * 左侧菜单栏组件
 * @author: zgy
 * @since: 2023-03-29
 * AsideMenu.vue
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Menu as IconMenu, Location, Expand, Fold } from '@element-plus/icons-vue'
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
  router.push('/taskList')
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
      active-text-color="#ffd04b"
      default-active="3"
      :collapse="isCollapse"
    >
      <el-menu-item class="el-menu-item" @click="changeCollapse">
        <el-icon v-if="isCollapse"><Expand /></el-icon>
        <el-icon v-if="!isCollapse"><Fold /></el-icon>
      </el-menu-item>
      <router-link v-slot="{ navigate }" to="/analyzeUrl" custom>
        <el-menu-item index="2" @click="navigate()">
          <el-icon><IconMenu /></el-icon>
          <!-- 加入router-link后文字无法自动隐藏，使用if手动隐藏 -->
          <div v-if="!isCollapse">视频列表</div>
        </el-menu-item>
      </router-link>
      <router-link v-slot="{ navigate }" to="/taskList" custom>
        <el-menu-item index="3" @click="navigate()">
          <el-icon><IconMenu /></el-icon>
          <!-- 加入router-link后文字无法自动隐藏，使用if手动隐藏 -->
          <div v-if="!isCollapse">
            任务列表
            <span v-if="taskStore.doingTask.length > 0">{{ taskStore.doingTask.length }}</span>
          </div>
        </el-menu-item>
      </router-link>
      <router-link v-slot="{ navigate }" to="/versions" custom>
        <el-menu-item index="4" @click="navigate()">
          <el-icon><Document /></el-icon>
          <div v-if="!isCollapse">版本号</div>
        </el-menu-item>
      </router-link>
      <el-menu-item index="5" @click="setWinSize()">
        <el-icon><Location /></el-icon>
        <template #title>重置窗口</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="less" scoped>
.el-menu {
  height: 100vh;
  border: 0;
}
.change-menu {
  bottom: 0;
}
el-menu--collapse {
  width: 100%;
}
</style>
