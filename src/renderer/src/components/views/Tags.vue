<!--
 * 标签组件
 * @author: zgy
 * @since: 2023-04-19
 * Tags.vue
-->
<script lang="ts" setup>
defineProps<{
  tags?: Array<common.model.TagData>
  sizeFormat: string
}>()
</script>
<template>
  <div class="container">
    <el-tag class="ml-2 tag">{{ sizeFormat }}</el-tag>
    <el-tag class="ml-2 tag" type="success">首次</el-tag>
    <!-- <el-tag class="ml-2 tag" type="success">下过</el-tag> -->
    <el-tag class="ml-2 tag" type="danger">删除</el-tag>
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
