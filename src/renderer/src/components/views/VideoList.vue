<!--
 * 我的订阅页面下载组件
 * @author: zgy
 * @since: 2023-03-29
 * AnalyzeUrl.vue
-->
<script setup lang="ts">
import { ref, reactive, onMounted, onActivated, watch } from 'vue'
import useWinStore from '../../store/useWinStore'
import useTaskStore from '../../store/useTaskStore'
import { ElMessage } from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { formatFileName, formatSize, formatDateTime } from '../../utils/format'

const winStore = useWinStore()
const taskStore = useTaskStore()

const isSubscribedDisable = ref(false)
const isAdvancedSearchShow = ref(false)
const tableRef = ref()
const tableReduce = ref(20)
const tableLoading = ref(true)
const tableData = ref([])
// 分页相关
const total = ref(100)
const currentPage = ref(1)
const pageSize = ref(24)

const searchForm = reactive({
  keywords: '',
  isSubscribed: '1',
  sort: 'date'
})

const handleSearchBtn = (): void => {
  loadData()
}

const loadData = (): void => {
  tableLoading.value = true
  const params = {
    sort: searchForm.sort,
    isSubscribed: searchForm.isSubscribed,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  }
  window.api
    .getVideoPageList(params)
    .then((res) => {
      res.results.forEach((item: common.model.Video) => {
        item.imgUrl = `https://i.iwara.tv/image/thumbnail/${item.file.id}/thumbnail-01.jpg`
        const previewSrcList: string[] = []
        for (let i = 0; i < 10; i++) {
          previewSrcList.push(
            `https://i.iwara.tv/image/thumbnail/${item.file.id}/thumbnail-0${i}.jpg`
          )
        }
        item.previewSrcList = previewSrcList
        // 添加进度数据
        item.process = 0
        // 添加进度状态数据
        item.status = true
        item.createdAtFormat = formatDateTime(item.createdAt)
        if (item.file) {
          item.sizeFormat = formatSize(item.file.size)
          item.source = 'iwara'
        } else {
          item.source = 'youtube'
        }
      })
      tableData.value = res.results
      total.value = res.count
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
    searchForm.isSubscribed = '0'
  }
}

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
          status: '0',
          retryNum: 0
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

// // 手动登录按钮
// const login = (): void => {
//   window.api.login()
// }

// const deleteData = (): void => {
//   window.api.testPool()
//   ElMessage.success('删除成功')
// }

const handleAdvancedSearchBtn = (): void => {
  isAdvancedSearchShow.value = !isAdvancedSearchShow.value
  if (isAdvancedSearchShow.value) {
    tableReduce.value = 75
  } else {
    tableReduce.value = 20
  }
}

onMounted(() => {
  loadData()
})
// 被keep-alive缓存的组件被激活时调用
onActivated(() => {
  if (tableData.value.length === 0) {
    loadData()
  }
})

watch(currentPage, (newVal, oldVal) => {
  loadData()
  console.log(newVal, oldVal)
})
watch(pageSize, (newVal, oldVal) => {
  loadData()
  console.log(newVal, oldVal)
})
</script>
<template>
  <el-card class="container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="搜索关键词" style="width: 70%">
        <el-input v-model="searchForm.keywords" placeholder="搜索关键词" />
      </el-form-item>

      <el-form-item style="margin-left: auto; margin-right: 0">
        <el-button type="primary" plain @click="handleAdvancedSearchBtn()"
          >高级搜索
          <el-icon v-show="!isAdvancedSearchShow" class="el-icon--right"><ArrowDown /></el-icon>
          <el-icon v-show="isAdvancedSearchShow" class="el-icon--right"><ArrowUp /></el-icon>
        </el-button>
        <el-button type="primary" plain @click="handleSearchBtn">搜索</el-button>
        <el-button type="primary" plain @click="addTasks()">下载</el-button>
      </el-form-item>
    </el-form>

    <el-collapse-transition>
      <div v-show="isAdvancedSearchShow">
        <el-form :inline="true" :model="searchForm" class="advanced-search">
          <el-form-item label="是否为关注列表">
            <el-select
              v-model="searchForm.isSubscribed"
              placeholder="是否为关注列表"
              :disabled="isSubscribedDisable"
            >
              <el-option label="是" value="1" />
              <el-option label="否" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序规则">
            <el-select
              v-model="searchForm.sort"
              placeholder="排序规则"
              @change="handleSortSelectChange"
            >
              <el-option label="日期" value="date" />
              <el-option label="趋势" value="trending" />
              <el-option label="受欢迎" value="popularity" />
              <el-option label="views" value="views" />
              <el-option label="likes" value="likes" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>

    <div v-loading="tableLoading" class="data-table">
      <el-table
        ref="tableRef"
        :data="tableData"
        :height="winStore.tableHeight - tableReduce"
        :border="true"
        stripe
      >
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="45" />
        <el-table-column label="预览" width="200">
          <template #default="scope">
            <el-image
              :src="scope.row.imgUrl"
              fit="contain"
              :preview-src-list="scope.row.previewSrcList"
              preview-teleported
              lazy
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="user.name" label="作者" width="100" show-overflow-tooltip />
        <el-table-column prop="source" label="源" width="85" show-overflow-tooltip />
        <el-table-column
          prop="sizeFormat"
          sortable
          label="文件大小"
          width="110"
          show-overflow-tooltip
        />
        <el-table-column prop="numLikes" sortable label="Likes" width="90" />
        <el-table-column
          prop="createdAtFormat"
          label="创建时间"
          width="165"
          sortable
          show-overflow-tooltip
        />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          background
          :page-sizes="[24, 50]"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :total="total"
        />
      </div>
    </div>
  </el-card>
</template>

<style lang="less" scoped>
.container {
  margin: 0;
  height: 100%;
}
.pagination {
  margin-top: 10px;
}

.demo-form-inline {
  display: flex;
}
.advanced-search {
  display: flex;
}
</style>
