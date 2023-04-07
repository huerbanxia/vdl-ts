import { defineStore } from 'pinia'
import _ from 'lodash'

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
      this.taskList.push(task)
    },
    deleteTask(id: string) {
      _.remove(this.taskList, { id: id })
    }
  }
})

export default useTaskStore
