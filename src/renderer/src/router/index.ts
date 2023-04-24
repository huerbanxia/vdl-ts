import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 任务列表组件在启动时就进行加载
import TaskList from '@renderer/components/views/TaskList.vue'

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    redirect: '/videoList'
  },
  // 使用别名方式 访问 / 或 /home 同一效果且url不会被替换
  // { path: '/', component: Home, alias: '/home' },
  {
    path: '/videoList',
    name: 'videoList',
    // 路由懒加载
    component: () => import('@renderer/components/views/VideoList.vue')
  },
  {
    path: '/videoListPic',
    name: 'videoListPic',
    component: () => import('@renderer/components/views/VideoListPic.vue')
  },
  {
    path: '/versions',
    name: 'versions',
    component: () => import('@renderer/components/views/Versions.vue')
  },
  {
    path: '/taskList',
    name: 'taskList',
    // component: () => import('@renderer/components/views/TaskList.vue')
    component: TaskList
  },
  {
    path: '/config',
    name: 'config',
    component: () => import('@renderer/components/views/Config.vue')
  }
]

const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHistory(),
  routes // `routes: routes` 的缩写
})

export default router
