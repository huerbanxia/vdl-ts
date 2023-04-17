import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
// elementPlus 按需加载插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// @ts-ignore bug
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          // 主进程预加载脚本
          index: resolve(__dirname, 'src/preload/index.ts'),
          // 解析下载预加载脚本
          loadurl: resolve(__dirname, 'src/preload/loadurl.ts'),
          // 获取token脚本
          getData: resolve(__dirname, 'src/preload/getData.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ['vue'],
        resolvers: [ElementPlusResolver()],
        dts: resolve('./src/renderer', 'auto-imports.d.ts')
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      ElementPlus({}),
      vue()
    ]
  }
})
