import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

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
    component: () => import('@renderer/components/views/TaskList.vue')
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
