<!--
 * 我的订阅页面下载组件
 * @author: zgy
 * @since: 2023-03-29
 * AnalyzeUrl.vue
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useWinStore from '../../store/useWinStore'
import useTaskStore from '../../store/useTaskStore'
import { ElMessage } from 'element-plus'
import { formatFileName, formatSize, formatDateTime } from '../../utils/format'

const winStore = useWinStore()
const taskStore = useTaskStore()

const word = ref('')
const sort = ref('date')
const isSubscribed = ref('1')
const isSubscribedDisable = ref(false)
const tableRef = ref()
const tableLoading = ref(true)
const tableData = ref([])

const loadData = (): void => {
  tableLoading.value = true
  const params = {
    sort: sort.value,
    isSubscribed: isSubscribed.value
  }
  window.api
    .getVideoPageList(params)
    .then((res) => {
      // https://i.iwara.tv/image/thumbnail/id/thumbnail-00.jpg
      res.results.forEach((item: common.model.Video) => {
        // 添加进度数据
        item.process = 0
        // 添加进度状态数据
        item.status = true
        item.createdAtFormat = formatDateTime(item.createdAt)
      })
      tableData.value = res.results
      tableLoading.value = false
    })
    .catch((e) => {
      console.log(e)
      tableLoading.value = false
      ElMessage.error('数据加载失败 请检查网络连接')
    })
}

const handleSortSelectChange = (val: string): void => {
  if (val === 'date') {
    isSubscribedDisable.value = false
  } else {
    isSubscribedDisable.value = true
    isSubscribed.value = '0'
  }
  loadData()
}

// 下载按钮点击事件
// const download = (): void => {
//   const rows = tableRef.value.getSelectionRows()
//   const data: common.params.IDownloadParam[] = []
//   rows.forEach((item: common.model.Video) => {
//     const info = {
//       id: item.id,
//       title: item.title,
//       slug: item.slug,
//       author: item.user.name,
//       fileId: item.file.id,
//       createdAt: item.createdAt.substring(0, 10).replaceAll('-', '%2F')
//     }
//     data.push(info)
//   })
//   // window.api.downloadVideo(data)
// }

const addTasks = (): void => {
  const rows = tableRef.value.getSelectionRows()
  if (rows.length > 0) {
    const data: common.model.Task[] = []
    let youtubeVideoNum = 0
    rows.forEach((item: common.model.Video) => {
      if (item.file) {
        const task: common.model.Task = {
          id: crypto.randomUUID(),
          videoId: item.id,
          fileId: item.file.id,
          title: item.title,
          titleFormat: formatFileName(item.title, ' '),
          slug: item.slug,
          author: item.user.name,
          size: item.file.size,
          sizeFormat: formatSize(item.file.size),
          process: 0,
          status: '0'
        }
        data.push(task)
      } else {
        youtubeVideoNum++
      }
    })
    if (youtubeVideoNum > 0) {
      ElMessage.warning(`跳过youtub源视频${youtubeVideoNum}个`)
    }
    taskStore.addTasks(data)
  } else {
    ElMessage.warning('未选择数据！')
  }
}

// const updateTableProcess = (id: string, process: number, status: boolean): void => {
//   tableData.value.forEach((item: common.model.Video) => {
//     if (item.id === id) {
//       item.process = process
//       item.status = status
//     }
//   })
// }

const getColor = (row): string => {
  if (row.status) {
    if (row.process === 100) {
      return '#5cb87a'
    }
    return '#1989fa'
  }
  return '#E06202'
}

// 手动登录按钮
const login = (): void => {
  window.api.login()
}

const deleteData = (): void => {
  window.api.testPool()
  console.log(132)
  ElMessage.success('删除成功')
}

onMounted(() => {
  loadData()
  // 注册下载进度侦听器
  // window.api.updateProcess((_e, data) => {
  //   updateTableProcess(data.id, data.process, data.status)
  // })
})
</script>
<template>
  <el-card class="container">
    <el-row :gutter="4">
      <el-col :span="2"
        ><el-button type="success" style="width: 100%" @click="login">登录</el-button></el-col
      >
      <el-col :span="9"><el-input v-model="word" placeholder="请输入关键字" /></el-col>
      <el-col :span="4"
        ><el-select
          v-model="isSubscribed"
          placeholder="是否为关注列表"
          :disabled="isSubscribedDisable"
        >
          <el-option label="是" value="1" />
          <el-option label="否" value="0" /> </el-select
      ></el-col>
      <el-col :span="3"
        ><el-select v-model="sort" placeholder="排序" @change="handleSortSelectChange">
          <el-option label="日期" value="date" />
          <el-option label="趋势" value="trending" />
          <el-option label="受欢迎" value="popularity" />
          <el-option label="views" value="views" />
          <el-option label="likes" value="likes" /> </el-select
      ></el-col>
      <el-col :span="2"><el-button style="width: 100%" @click="loadData">刷新</el-button></el-col>
      <el-col :span="2"
        ><el-button type="primary" plain style="width: 100%" @click="addTasks()"
          >下载</el-button
        ></el-col
      >
      <el-col :span="2"
        ><el-button style="width: 100%" type="danger" plain @click="deleteData()"
          >删除</el-button
        ></el-col
      >
    </el-row>
    <div class="data-table">
      <el-table
        ref="tableRef"
        v-loading="tableLoading"
        :data="tableData"
        :height="winStore.tableHeight"
        :border="true"
        stripe
      >
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="45" />
        <el-table-column prop="title" label="标题" width="180" show-overflow-tooltip />
        <el-table-column prop="user.name" label="作者" width="100" show-overflow-tooltip />
        <el-table-column prop="numLikes" sortable label="Likes" width="90" />
        <el-table-column
          prop="createdAtFormat"
          label="创建时间"
          width="165"
          sortable
          show-overflow-tooltip
        />
        <el-table-column label="下载进度">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.process"
              :stroke-width="20"
              :text-inside="false"
              :color="getColor(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<style lang="less" scoped>
.container {
  margin: 0;
  height: 100%;
}
.data-table {
  margin-top: 15px;
}
</style>
