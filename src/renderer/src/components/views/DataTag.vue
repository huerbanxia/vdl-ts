<!--
 * 展示 view like 数组件
 * @author: zgy
 * @since: 2023-04-19
 * DataTag.vue
-->
<script lang="ts" setup>
const props = defineProps<{
  numViews: number
  numLikes: number
}>()
</script>
<template>
  <div class="container">
    <el-tag class="data-tag" effect="dark" type="info">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="eye"
        class="svg-inline--fa fa-eye"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 576 512"
      >
        <path
          fill="currentColor"
          d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM432 256c0 79.5-64.5 144-144 144s-144-64.5-144-144s64.5-144 144-144s144 64.5 144 144zM288 192c0 35.3-28.7 64-64 64c-11.5 0-22.3-3-31.6-8.4c-.2 2.8-.4 5.5-.4 8.4c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-2.8 0-5.6 .1-8.4 .4c5.3 9.3 8.4 20.1 8.4 31.6z"
        ></path>
      </svg>
      {{ props.numViews }}
    </el-tag>
    <el-tag class="data-tag" effect="dark" type="info">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="heart"
        class="svg-inline--fa fa-heart"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"
        ></path>
      </svg>
      {{ props.numLikes }}</el-tag
    >
  </div>
</template>

<style scoped>
.container {
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

svg {
  width: 10px;
  height: 10px;
}
</style>
