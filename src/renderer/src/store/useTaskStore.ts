import { defineStore } from 'pinia'
import _ from 'lodash'
import { ElMessage } from 'element-plus'

interface TaskState {
  taskList: common.model.Task[]
}

let intervalId = 0
const waitList: common.model.Task[] = []
// 窗口信息仓库
const useTaskStore = defineStore('taskStore', {
  state: (): TaskState => {
    const taskList: common.model.Task[] = []
    return {
      taskList
    }
  },
  // 开启持久化存储
  persist: true,
  getters: {
    doingTask: (state) => {
      const filterList = _.filter(state.taskList, (item) => {
        return item.status === '0' || item.status === '1' || item.status === '2'
      })
      return _.sortBy(filterList, (item) => {
        if (item.addTime) {
          return item.addTime
        }
        return 0
      })
    },
    doneTask: (state) => {
      const filterList = _.filter(state.taskList, (item) => {
        return item.status === '3' || Number(item.status) < 0
      })
      return _.sortBy(filterList, (item) => {
        if (item.completeTime) {
          return -item.completeTime
        }
        return 0
      })
    }
  },
  actions: {
    addTask(task: common.model.Task) {
      const index = _.findIndex(this.taskList, { fileId: task.fileId })
      if (index === -1) {
        task.addTime = Date.now()
        this.taskList.push(task)
        waitList.push(task)
        return true
      }
      return false
    },
    addTasks(tasks: common.model.Task[]) {
      if (tasks.length > 0) {
        let successNum = 0
        tasks.forEach((item) => {
          if (this.addTask(item)) {
            successNum++
          }
        })
        if (successNum === tasks.length) {
          this.sendTask()
          ElMessage.success(`成功添加${successNum}个下载任务 请到任务列表查看`)
        } else if (successNum < tasks.length && successNum > 0) {
          this.sendTask()
          ElMessage.success(
            `成功添加${successNum}个下载任务 跳过重复任务${tasks.length - successNum}个`
          )
        } else {
          ElMessage.warning(`所选任务已存在！`)
        }
      }
    },
    sendTask() {
      if (intervalId === 0) {
        intervalId = window.setInterval(() => {
          if (waitList.length > 0) {
            window.api.downloadVideo(waitList.pop())
          } else {
            clearInterval(intervalId)
            intervalId = 0
          }
        }, 4000)
      }
    },
    deleteTask(id: string) {
      const deletedTask = _.remove(this.taskList, { id: id })
      if (deletedTask.length > 0) {
        ElMessage({
          message: `成功删除${deletedTask.length}个下载任务`,
          type: 'success',
          grouping: true
        })
      }
    },
    updataProcess(taskId: string, process: number, status: string, savePath: string) {
      this.taskList.forEach((item) => {
        if (taskId == item.id) {
          item.process = process
          item.status = status
          if (savePath) {
            item.savePath = savePath
            item.completeTime = Date.now()
          }
        }
      })
    }
  }
})

export default useTaskStore
