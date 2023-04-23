<!--
 * 标题栏
 * @author: zgy
 * @since: 2023-03-29
 * AsideMenu.vue
-->
<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { Sunny, Moon } from '@element-plus/icons-vue'
import useThemeStore from '@renderer/store/useThemeStore'

const isDark = useDark()
// const toggleDark = useToggle(isDark)
// const darkSwitch = ref(false)

const themeStore = useThemeStore()
themeStore.setDark(isDark.value)

const handleDarkBtnClick = (): void => {
  themeStore.setDark(isDark.value)
}
</script>
<template>
  <div class="title-bar">
    <span>VDL</span>
    <div class="switch-button">
      <el-switch
        v-model="isDark"
        style="--el-switch-on-color: #545c64"
        inline-prompt
        :active-icon="Sunny"
        :inactive-icon="Moon"
        @change="handleDarkBtnClick()"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '../assets/css/title-bar.less';
</style>
