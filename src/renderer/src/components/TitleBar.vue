<!--
 * 标题栏
 * @author: zgy
 * @since: 2023-03-29
 * AsideMenu.vue
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { Sunny, Moon } from '@element-plus/icons-vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const value1 = ref(false)

const handleDarkBtnClick = (): void => {
  toggleDark()
}
</script>
<template>
  <div class="title-bar">
    <span>VDL</span>
    <div class="switch-button">
      <el-switch
        v-model="value1"
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
