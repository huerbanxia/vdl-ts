<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IpcRendererEvent } from 'electron'
import type { TabsPaneContext } from 'element-plus'
import useTaskStore from '../../store/useTaskStore'
import useWinStore from '../../store/useWinStore'

const winStore = useWinStore()
const taskStore = useTaskStore()
const activeName = ref('doing')
const doingTableLoading = ref(false)

const handleClick = (tab: TabsPaneContext, event: Event): void => {
  console.log(tab, event)
}

const handleDeleteTask = (row: common.model.Task): void => {
  taskStore.deleteTask(row.id)
}
const getStatusName = (status: string): string => {
  let statusName = ''
  switch (status) {
    case '0':
      statusName = '等待解析'
      break
    case '1':
      statusName = '等待下载'
      break
    case '2':
      statusName = '下载中'
      break
    case '3':
      statusName = '下载完成'
      break
    case '-1':
      statusName = '出错'
      break
  }
  return statusName
}

const updateStoreProcess = (
  taskId: string,
  process: number,
  status: string,
  savePath: string
): void => {
  taskStore.updataProcess(taskId, process, status, savePath)
}

const getColor = (row: common.model.Task): string => {
  if (Number(row.status) >= 0) {
    if (row.process === 100) {
      return '#5cb87a'
    }
    return '#1989fa'
  }
  return '#E06202'
}

onMounted(() => {
  window.api.updateProcess((_event: IpcRendererEvent, data: common.params.IUpdateProcessParam) => {
    updateStoreProcess(data.taskId, data.process, data.status, data.savePath)
  })
})
</script>

<template>
  <el-card class="container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="正在下载" name="doing">
        <el-row class="button-group">
          <el-button type="danger">批量删除</el-button>
          <el-button type="primary">打开下载路径</el-button>
        </el-row>
        <el-table
          v-loading="doingTableLoading"
          :data="taskStore.doingTask"
          border
          :height="winStore.tableHeight - 40"
          style="width: 100%"
        >
          <el-table-column type="selection" width="45" />
          <el-table-column prop="title" label="标题" show-overflow-tooltip width="400" />
          <el-table-column prop="sizeFormat" label="文件大小" show-overflow-tooltip width="100" />
          <el-table-column prop="status" label="下载状态" show-overflow-tooltip width="100">
            <template #default="scope">
              {{ getStatusName(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column prop="process" label="下载进度">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.process"
                :stroke-width="10"
                :color="getColor(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100">
            <template #default="scope">
              <el-button type="danger" @click="handleDeleteTask(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="已完成" name="done">
        <el-table
          :data="taskStore.doneTask"
          border
          :height="winStore.tableHeight - 40"
          style="width: 100%"
        >
          <el-table-column type="selection" width="45" />
          <el-table-column prop="title" label="标题" show-overflow-tooltip width="400" />
          <el-table-column prop="sizeFormat" label="文件大小" show-overflow-tooltip width="100" />
          <el-table-column prop="savePath" label="保存路径" show-overflow-tooltip />
          <el-table-column fixed="right" label="操作" width="200">
            <template #default="scope">
              <el-button type="danger" plain @click="handleDeleteTask(scope.row)">删除</el-button>
              <el-button type="primary" plain @click="handleDeleteTask(scope.row)"
                >打开文件</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<style lang="less">
.container {
  margin: 0;
  height: 100%;
}
.button-group {
  height: 40px;
}
</style>
