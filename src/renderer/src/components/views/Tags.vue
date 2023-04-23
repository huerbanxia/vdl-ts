<!--
 * 标签组件
 * @author: zgy
 * @since: 2023-04-19
 * Tags.vue
-->
<script lang="ts" setup>
import { formatSize } from '@renderer/utils/format'
defineProps<{
  tags: Array<common.model.TagData>
  size: number
  first?: boolean
  saved?: boolean
  deleted?: boolean
  author?: string
}>()
</script>
<template>
  <div class="container">
    <el-tag v-if="author" class="ml-2 tag" type="warning">{{ author }}</el-tag>
    <el-tag v-if="size" class="ml-2 tag">{{ formatSize(size) }}</el-tag>
    <el-tag v-if="first" class="ml-2 tag" type="success">首次</el-tag>
    <el-tag v-if="saved" class="ml-2 tag" type="success">下载过</el-tag>
    <el-tag v-if="deleted" class="ml-2 tag" type="danger">删除</el-tag>
    <br />
    <el-scrollbar max-height="50px">
      <el-tag v-for="(data, index) in tags" :key="index" class="ml-2 tag">{{ data.id }}</el-tag>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.container {
  margin-top: 8px;
  margin-bottom: 5px;
  max-height: 80px;
  overflow: hidden;
}
.tag {
  margin-top: 5px;
  margin-right: 5px;
  cursor: pointer;
}
</style>
