import { AsyncResource } from 'async_hooks'
import { EventEmitter } from 'events'
import { resolve } from 'path'
import createWorker from './task_processor?nodeWorker'
import { Worker } from 'node:worker_threads'
import log from 'electron-log'

const kTaskInfo = Symbol('kTaskInfo')
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent')

type CallbackFunction = (...args: any[]) => void

class WorkerPoolTaskInfo extends AsyncResource {
  callback: CallbackFunction
  constructor(callback: CallbackFunction) {
    super('WorkerPoolTaskInfo')
    this.callback = callback
  }

  done(err, result): void {
    this.runInAsyncScope(this.callback, null, err, result)
    this.emitDestroy() // `TaskInfo`s are used only once.
  }
}

interface Task {
  taskData: TaskData
  callback: CallbackFunction
}

interface TaskData {
  data: object
}

class WorkerPool extends EventEmitter {
  numThreads: number
  workers: Array<Worker>
  freeWorkers: Array<Worker>
  tasks: Array<Task>

  constructor(numThreads: number) {
    super()
    this.numThreads = numThreads
    this.workers = []
    this.freeWorkers = []
    this.tasks = []

    log.info(`初始化下载线程池大小为${this.numThreads}`)

    for (let i = 0; i < numThreads; i++) this.addNewWorker()

    // 每当发出 kWorkerFreedEvent 时，调度队列中待处理的下一个任务（如果有）。
    this.on(kWorkerFreedEvent, () => {
      if (this.tasks.length > 0) {
        const taskInfo = this.tasks.shift()
        this.runTask(taskInfo!.taskData, taskInfo!.callback)
      }
    })
  }

  addNewWorker(): void {
    // @ts-ignore 修改后的参数
    const worker = createWorker(resolve(__dirname, 'task_processor.js'))
    log.info('创建子线程 线程id:', worker.threadId)
    worker.on('message', (result) => {
      // 获取到信息后调用回返回信息
      if (worker[kTaskInfo]) {
        // 此处判断下载完成且worker[kTaskInfo]存在才进行下面的操作
        worker[kTaskInfo].callback(null, result)
        if (result.over) {
          // 如果成功：调用传递给`runTask`的回调，删除与Worker关联的`TaskInfo`，并再次将其标记为空闲。
          // 此处判断下载完成且worker[kTaskInfo]存在才进行下面的操作
          worker[kTaskInfo].done(null, result)
          worker[kTaskInfo] = null
          this.freeWorkers.push(worker)
          this.emit(kWorkerFreedEvent)
        }
      }
    })
    worker.on('error', (err) => {
      // 如果发生未捕获的异常：调用传递给 `runTask` 并出现错误的回调。
      log.error('error')
      if (worker[kTaskInfo]) worker[kTaskInfo].done(err, null)
      else this.emit('error', err)
      // 从列表中删除 Worker 并启动一个新的 Worker 来替换当前的 Worker。
      this.workers.splice(this.workers.indexOf(worker), 1)
      this.addNewWorker()
    })
    this.workers.push(worker)
    this.freeWorkers.push(worker)
    this.emit(kWorkerFreedEvent)
  }

  runTask(taskData: TaskData, callback: CallbackFunction): void {
    log.info(`当前空闲线程数${this.freeWorkers.length}`)
    if (this.freeWorkers.length === 0) {
      // 没有空闲线程，等待工作线程空闲。
      this.tasks.push({ taskData: taskData, callback })
      return
    }

    const worker = this.freeWorkers.pop()
    worker![kTaskInfo] = new WorkerPoolTaskInfo(callback)
    worker!.postMessage(taskData)
  }

  close(): void {
    for (const worker of this.workers) worker.terminate()
  }
}

export default WorkerPool
