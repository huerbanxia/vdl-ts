<!--
 * 视频项
 * @author: zgy
 * @since: 2023-04-19
 * VideoItem.vue
-->
<script lang="ts" setup>
import { Picture as IconPicture } from '@element-plus/icons-vue'
import Tags from '@renderer/components/views/Tags.vue'
import { ref, watch } from 'vue'

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
  <el-card class="video-item" @click="handleClick">
    <!-- @click.stop="() => {}"阻止冒泡事件导致执行两次无法选中 -->
    <div class="check-box" :class="{ 'check-box-active': isCheck }">
      <el-checkbox v-model="isCheck" label="勾选下载" @click.stop="() => {}" />
    </div>

    <el-carousel
      indicator-position="none"
      arrow="never"
      height="160px"
      :autoplay="isAutoPlay"
      :pause-on-hover="false"
      :interval="800"
      class="carousel"
      @mouseover="handleMouseoverEvent()"
      @mouseleave="handleMouseleaveEvent()"
    >
      <data-tag :num-views="video.numViews" :num-likes="video.numLikes"></data-tag>

      <el-carousel-item v-if="!isAutoPlay" :key="0">
        <!-- 图片尺寸 220*160 -->
        <el-image :src="video.imgUrl" fit="contain" style="width: 100%" draggable="false">
          <template #error>
            <el-icon><icon-picture /></el-icon>
          </template>
        </el-image>
      </el-carousel-item>

      <template v-if="isAutoPlay">
        <el-carousel-item v-for="(img, imgIndex) in video.previewSrcList" :key="imgIndex">
          <!-- 图片尺寸 220*160 -->
          <el-image :src="img" fit="contain" style="width: 100%" draggable="false">
            <template #error>
              <el-icon><icon-picture /></el-icon>
            </template>
          </el-image>
        </el-carousel-item>
      </template>
    </el-carousel>

    <tags
      :author="video.user.name"
      :tags="video.tags"
      :first="video.isFirst"
      :saved="video.isSaved"
      :deleted="video.isDeleted"
      :size="video.file.size"
    ></tags>
    <el-text>{{ video.user.name + ' - ' + video.title }}</el-text>
  </el-card>
</template>

<style lang="less" scoped>
.video-item {
  height: 350px;
  margin-bottom: 10px;
}
.carousel {
  cursor: pointer;
  // 禁止图片拖动 在img标签配置属性 draggable=false pointer-events会禁止pointer相关的鼠标事件
  // pointer-events: none;
  // 禁止选中
  user-select: none;
}
.check-box {
  width: 100%;
}
.check-box-active {
  background-color: #43434b;
  border-radius: 10px 10px 0 0;
}
</style>
