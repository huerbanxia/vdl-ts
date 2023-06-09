<!--
 * 设置页面
 * @author: zgy
 * @since: 2023-04-11
 * Config.vue
-->
<script lang="ts" setup>
import useSettingStore from '@renderer/store/useSettingStore'
import useWinStore from '@renderer/store/useWinStore'
import { formatSize } from '@renderer/utils/format'
import { IpcRendererEvent } from 'electron'
import { CollapseModelValue } from 'element-plus'
import { storeToRefs } from 'pinia'
import { onActivated, onMounted, reactive, ref } from 'vue'

const dialogVisible = ref(false)

// 仓库初始化
const winStore = useWinStore()
const settingStore = useSettingStore()

const { setting: configForm } = storeToRefs(settingStore)

const dataBaseInfo = reactive({
  count: 0,
  fileSize: 0
})

// 默认展开项
const activeNames = ref(['0', '1', '2', '3'])
const handleChange = (value: CollapseModelValue): void => {
  console.log(value)
}
// 保存设置
const handleSaveConfig = (): void => {
  settingStore.saveSetting(configForm.value)
}

const handleResetConfig = (): void => {
  settingStore.resetSetting()
  dialogVisible.value = false
}

const handleSelectSavePathBtn = (): void => {
  window.api.openSaveDialog().then((result: Electron.OpenDialogReturnValue) => {
    if (!result.canceled && result.filePaths.length > 0) {
      configForm.value.download.savePath = result.filePaths[0]
    }
  })
}

// 手动登录按钮
const handleLoginBtn = (): void => {
  window.api.login()
}

const handleResetDb = (): void => {
  window.api.scanDir()
}

onActivated(() => {
  settingStore.init()

  window.api.getDataBaseInfo().then((info: common.params.DataBaseInfo) => {
    dataBaseInfo.count = info.count
    dataBaseInfo.fileSize = info.fileSize
  })
})
onMounted(() => {
  window.api.updateConfig((_event: IpcRendererEvent, data: common.AppSetting) => {
    settingStore.init(data)
  })
})
</script>
<template>
  <el-scrollbar :max-height="winStore.height">
    <el-card class="container">
      <el-row :gutter="0">
        <el-col :span="8"></el-col>
        <el-col :span="16"
          ><el-form
            ref="formRef"
            :model="configForm"
            label-position="right"
            label-width="auto"
            style="width: 500px"
          >
            <el-collapse v-model="activeNames" @change="handleChange">
              <el-collapse-item name="0">
                <template #title>
                  <h2>用户</h2>
                </template>

                <el-form-item label="用户Token">
                  <el-input v-model="configForm.axios.authorization" />
                </el-form-item>
                <el-form-item>
                  <el-button plain @click="handleLoginBtn">登录</el-button>
                </el-form-item>
              </el-collapse-item>

              <el-collapse-item name="1">
                <template #title>
                  <h2>代理</h2>
                </template>

                <el-form-item label="开启代理" style="margin-top: 10px">
                  <el-switch
                    v-model="configForm.isOpenProxy"
                    size="large"
                    active-text="开"
                    inactive-text="关"
                  />
                </el-form-item>
                <el-form-item label="协议" style="margin-top: 10px">
                  <el-select
                    v-model="configForm.proxy.protocol"
                    placeholder="请选择代理协议"
                    style="width: 100%"
                    :disabled="!configForm.isOpenProxy"
                  >
                    <el-option label="http" value="http" />
                    <el-option label="https" value="https" />
                  </el-select>
                </el-form-item>
                <el-form-item label="主机">
                  <el-input v-model="configForm.proxy.host" :disabled="!configForm.isOpenProxy" />
                </el-form-item>
                <el-form-item label="端口">
                  <el-input v-model="configForm.proxy.port" :disabled="!configForm.isOpenProxy" />
                </el-form-item>
              </el-collapse-item>

              <el-collapse-item name="2">
                <template #title>
                  <h2>下载</h2>
                </template>

                <el-form-item label="保存路径" style="margin-top: 10px">
                  <el-button plain style="width: 25%" @click="handleSelectSavePathBtn"
                    >选择路径</el-button
                  >
                  <el-input
                    v-model="configForm.download.savePath"
                    style="width: 73%; margin-right: 2%"
                  />
                </el-form-item>
                <el-form-item label="同时下载任务数">
                  <el-input v-model="configForm.download.maxTaskNum" />
                </el-form-item>
                <el-form-item label="解析下载链接等待时间(ms)">
                  <el-input v-model="configForm.download.waitTime" />
                </el-form-item>
                <el-form-item label="解析间隔(ms)">
                  <el-input v-model="configForm.download.intervalTime" />
                </el-form-item>
                <el-form-item label="解析失败后最大重试次数">
                  <el-input v-model="configForm.download.failRetryNum" />
                </el-form-item>

                <el-form-item label="下载请求超时时间(ms)">
                  <el-input v-model="configForm.axios.timeout" />
                </el-form-item>
              </el-collapse-item>

              <el-collapse-item name="3">
                <template #title>
                  <h2>数据库</h2>
                </template>

                <el-form-item label="当前数据量"> {{ dataBaseInfo.count }} 条 </el-form-item>
                <el-form-item label="数据文件大小">
                  {{ formatSize(dataBaseInfo.fileSize) }}
                </el-form-item>
                <el-form-item label="">
                  <el-button plain style="width: 20%" @click="handleResetDb">重建数据库 </el-button>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>

            <div class="button-group">
              <el-button type="primary" plain @click="handleSaveConfig">保存设置</el-button>
              <el-button type="primary" plain style="margin-left: 0" @click="dialogVisible = true"
                >重置设置</el-button
              >
            </div>
          </el-form>
        </el-col>
      </el-row>

      <el-dialog v-model="dialogVisible" title="确认" width="30%">
        <span> 此操作无法恢复！确认要重置设置吗? </span>
        <template #footer>
          <span class="dialog-footer">
            <el-button plain @click="dialogVisible = false"> 取消 </el-button>
            <el-button type="warning" plain @click="handleResetConfig"> 确定 </el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </el-scrollbar>
</template>

<style lang="less" scoped>
@import '@renderer/assets/css/config.less';
</style>
