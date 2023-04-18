<!--
 * 项目主窗口 组织所有页面
 * @author: zgy
 * @since: 2023-03-29
 * AsideMenu.vue
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AsideMenu from './AsideMenu.vue'
import TitleBar from './TitleBar.vue'
import 'animate.css'
// import { ElMessage } from 'element-plus'

/**
 * type: 'success' | 'warning' | 'info' | 'error'
 */
// const showMessage = (type, msg): void => {
//   ElMessage({
//     message: msg,
//     type: type
//   })
// }
onMounted(() => {
  // 注册全局消息钩子
  // window.api.showMessage((_event, type: string, msg: string) => {
  //   showMessage(type, msg)
  // })
})

const isCollapse = ref(false)
const changeCollapse = (collapse: boolean): void => {
  isCollapse.value = collapse
}
</script>
<template>
  <el-container>
    <el-aside :class="[isCollapse ? 'aside-fold' : 'aside-expand', 'el-aside-dark']">
      <AsideMenu @change-collapse="changeCollapse"></AsideMenu>
    </el-aside>
    <el-container>
      <el-header>
        <TitleBar></TitleBar>
      </el-header>
      <el-main>
        <!-- vue3.0配置 -->
        <router-view v-slot="{ Component, route }">
          <!-- <transition name="el-fade-in-linear"> -->
          <transition mode="out-in">
            <keep-alive>
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="less" scoped>
@import '../assets/css/home.less';
</style>
