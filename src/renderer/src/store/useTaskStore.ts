import { defineStore } from 'pinia'
import _ from 'lodash'
import { ElMessage } from 'element-plus'

interface TaskState {
  taskList: common.model.Task[]
}
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
      return state.taskList
    },
    doneTask: (state) => {
      return state.taskList
    }
  },
  actions: {
    addTask(task: common.model.Task) {
      const index = _.findIndex(this.taskList, { fileId: task.fileId })
      if (index === -1) {
        this.taskList.push(task)
        return true
      }
      return false
    },
    addTasks(tasks: common.model.Task[]) {
      let successNum = 0
      tasks.forEach((item) => {
        if (this.addTask(item)) {
          successNum++
        }
      })
      if (successNum === tasks.length) {
        ElMessage.success(`成功添加${successNum}个下载任务 请到任务列表查看`)
      } else if (successNum < tasks.length && successNum > 0) {
        ElMessage.success(
          `成功添加${successNum}个下载任务 跳过重复任务${tasks.length - successNum}个`
        )
      } else {
        ElMessage.warning(`所选任务已存在！`)
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
    }
  }
})

export default useTaskStore
