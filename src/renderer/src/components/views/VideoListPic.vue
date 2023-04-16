<!--
 * 视频列表 照片墙模式
 * @author: zgy
 * @since: 2023-04-12
 * VideoListPic.vue
-->
<script lang="ts" setup>
import { ref, reactive, onMounted, watch, Ref } from 'vue'
import { ElMessage } from 'element-plus'
// import useWinStore from '../../store/useWinStore'
import useTaskStore from '../../store/useTaskStore'
import { ArrowDown, ArrowUp, Picture as IconPicture } from '@element-plus/icons-vue'
import { formatFileName, formatSize, formatDateTime } from '../../utils/format'

// 仓库初始化
// const winStore = useWinStore()
const taskStore = useTaskStore()

// 分页相关
const total = ref(100)
const currentPage = ref(1)
const pageSize = ref(24)

const tableData: Ref<Array<common.model.Video>> = ref([])
const isAdvancedSearchShow = ref(false)
const tableRef = ref()
const isSubscribedDisable = ref(false)
const listLoading = ref(false)
const isAll = ref(false)
const isAffixTopPadding = ref(false)

// 搜索
const searchForm = reactive({
  keywords: '',
  isSubscribed: '1',
  sort: 'date'
})

// 加载表格数据
const loadData = (): void => {
  listLoading.value = true
  const params = {
    sort: searchForm.sort,
    isSubscribed: searchForm.isSubscribed,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  }

  // 请求主进程获取数据
  window.api
    .getVideoPageList(params)
    .then((res) => {
      console.log(res.results)
      res.results.forEach((item: common.model.Video) => {
        // 添加进度数据
        item.process = 0
        // 添加进度状态数据
        item.status = true
        item.createdAtFormat = formatDateTime(item.createdAt)
        if (item.file) {
          item.sizeFormat = formatSize(item.file.size)
          item.source = 'iwara'

          item.imgUrl = `https://i.iwara.tv/image/thumbnail/${item.file.id}/thumbnail-00.jpg`
          const previewSrcList: string[] = []
          for (let i = 0; i <= 11; i++) {
            previewSrcList.push(
              `https://i.iwara.tv/image/thumbnail/${item.file.id}/thumbnail-${i
                .toString()
                .padStart(2, '0')}.jpg`
            )
          }
          item.previewSrcList = previewSrcList
        } else {
          item.source = 'youtube'
        }
      })
      tableData.value = res.results
      total.value = res.count
    })
    .catch((e) => {
      console.log(e)
      ElMessage.error('数据加载失败 请检查网络连接')
    })
    .finally(() => {
      listLoading.value = false
    })
}

// 下载按钮
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

// 搜索按钮
const handleSearchBtn = (): void => {
  loadData()
}

const handleSortSelectChange = (val: string): void => {
  if (val === 'date') {
    isSubscribedDisable.value = false
  } else {
    isSubscribedDisable.value = true
    searchForm.isSubscribed = '0'
  }
}
const handlePicItemClick = (index: number): void => {
  //TODO 添加点击选中功能
  console.log(index)
  tableData[index].isCheck = !tableData[index].isCheck
}
const handleAffixScroll = ({ scrollTop, fixed }): void => {
  console.log(scrollTop, fixed)
  if (scrollTop > 20) {
    isAffixTopPadding.value = true
  } else {
    isAffixTopPadding.value = false
  }
}

onMounted(() => {
  loadData()
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
    <el-affix :offset="41" @scroll="handleAffixScroll">
      <div class="affix-no-padding" :class="{ 'affix-padding': isAffixTopPadding }">
        <!-- 搜索部分 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="搜索关键词" style="width: 70%">
            <el-input v-model="searchForm.keywords" placeholder="搜索关键词" />
          </el-form-item>
          <el-form-item style="margin-left: auto; margin-right: 0">
            <el-button type="primary" plain @click="isAdvancedSearchShow = !isAdvancedSearchShow"
              >高级搜索
              <el-icon v-show="!isAdvancedSearchShow" class="el-icon--right"><ArrowDown /></el-icon>
              <el-icon v-show="isAdvancedSearchShow" class="el-icon--right"><ArrowUp /></el-icon>
            </el-button>
            <el-button type="primary" plain @click="handleSearchBtn">搜索</el-button>
            <el-button type="primary" plain @click="addTasks()">下载</el-button>
          </el-form-item>
          <!-- 高级搜索部分 -->
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
        </el-form>
        <!-- 页首分页 -->
        <div v-if="tableData.length > 0" class="pagination-top">
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
    </el-affix>

    <!-- 视频列表 -->
    <div v-loading="listLoading" class="video-list">
      <!-- 视频主体部分 -->
      <el-checkbox v-model="isAll" label="全选" />
      <el-row :gutter="30">
        <el-col v-for="(item, index) in tableData" :key="index" :span="6">
          <div @click="handlePicItemClick(index)">
            <el-checkbox v-model="item.isCheck" label="勾选下载" />
            <el-carousel
              indicator-position="none"
              height="160px"
              :autoplay="false"
              style="cursor: pointer"
            >
              <el-carousel-item v-for="(img, imgIndex) in item.previewSrcList" :key="imgIndex">
                <!-- 图片尺寸 220*160 -->
                <el-image :src="img" fit="contain" style="width: 100%">
                  <template #error>
                    <el-icon><icon-picture /></el-icon>
                  </template>
                </el-image>
              </el-carousel-item>
            </el-carousel>
            {{ item.title }}
          </div>
        </el-col>
      </el-row>

      <!-- 页脚分页 -->
      <div v-if="tableData.length > 0" class="pagination-bottom">
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
  overflow: auto;
}
// :deep(.el-card__body) {
//   padding-top: 0px;
// }
.affix {
  background-color: #1d1e1f;
}
.affix-no-padding {
  .affix();
  animation: affixPaddingLeave 0.3s;
}
.affix-padding {
  .affix();
  padding-top: 10px;
  padding-bottom: 10px;
  animation: affixPaddingEnter 0.5s;
}

@keyframes affixPaddingEnter {
  0% {
    padding-top: 0;
    padding-bottom: 0;
  }
  100% {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}

@keyframes affixPaddingLeave {
  0% {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  100% {
    padding-top: 0;
    padding-bottom: 0;
  }
}

.pagination-top {
  margin-bottom: 10px;
}
.pagination-bottom {
  margin-top: 10px;
}
</style>
