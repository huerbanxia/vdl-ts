<!--
 * 视频项
 * @author: zgy
 * @since: 2023-04-19
 * VideoItem.vue
-->
<script lang="ts" setup>
import { ref, watch } from 'vue'
import Tags from '@renderer/components/views/Tags.vue'
import { Picture as IconPicture } from '@element-plus/icons-vue'

const props = defineProps<{
  index: number
  video: common.model.Video
}>()
// 运行时
const emit = defineEmits(['change'])

const isAutoPlay = ref(false)
const isCheck = ref(false)

const handleClick = (): void => {
  isCheck.value = !isCheck.value
}

// 鼠标悬停开启自动轮播
const handleMouseoverEvent = (): void => {
  isAutoPlay.value = true
}
const handleMouseleaveEvent = (): void => {
  isAutoPlay.value = false
}
watch(isCheck, () => {
  emit('change', props.index, isCheck)
})
</script>
<template>
  <div class="container" @click="handleClick">
    <!-- @click.stop="() => {}"阻止冒泡事件导致执行两次无法选中 -->
    <el-checkbox v-model="isCheck" label="勾选下载" @click.stop="() => {}" />

    <el-carousel
      indicator-position="none"
      arrow="never"
      height="160px"
      :autoplay="isAutoPlay"
      :pause-on-hover="false"
      :interval="800"
      style="cursor: pointer"
      @mouseover="handleMouseoverEvent()"
      @mouseleave="handleMouseleaveEvent()"
    >
      <data-tag :num-views="video.numViews" :num-likes="video.numLikes"></data-tag>
      <el-carousel-item v-for="(img, imgIndex) in video.previewSrcList" :key="imgIndex">
        <!-- 图片尺寸 220*160 -->
        <el-image :src="img" fit="contain" style="width: 100%">
          <template #error>
            <el-icon><icon-picture /></el-icon>
          </template>
        </el-image>
      </el-carousel-item>
    </el-carousel>

    <tags :tags="video.tags"></tags>
    <el-text>{{ video.user.name + ' - ' + video.title }}</el-text>
  </div>
</template>

<style scoped></style>
