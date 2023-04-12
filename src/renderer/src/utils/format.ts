/**
 * 文件大小转换/单位换算
 * @param size 文件大小 单位 Byte
 * @param pointLength 保留小数位 默认为2
 * @param units 指定单位
 * @returns {*}
 */
export function formatSize(size: number, pointLength?: number, units?: string[]): string {
  let unit: string | undefined
  units = units || ['B', 'K', 'M', 'G']
  while ((unit = units.shift()) && size > 1024) {
    size = size / 1024
  }
  return (unit === 'B' ? size : size.toFixed(pointLength === undefined ? 2 : pointLength)) + unit!
}

/**
 * 文件名格式化
 * @param fileName 要格式化的文件名
 * @param character 替换特殊字符的字符 默认为 -
 * @returns 格式化后的文件名
 */
export function formatFileName(fileName: string, character?: string): string {
  // g 全局匹配 m 多行匹配 i 忽略大小写
  // 匹配 / 用 四个 /
  const reg = new RegExp('[/|*|\\|^|?|<|>|"|:|\\\\]', 'g')
  if (fileName) {
    character = character ? character : (character = '-')
    return fileName.replace(reg, character)
  }
  return ''
}

/**
 * 数字补0操作
 * @param num 要补0的数据
 * @returns 补0完成的数据
 */
function addZero(num: number): string {
  return num < 10 ? '0' + num : num + ''
}
/**
 * 日期数据 格式化 （公共函数）
 * @param date 标准日期字符串
 * @returns 格式化的日期字符串 2023-01-01 00:00:00
 */
export function formatDateTime(date: string): string {
  const time = new Date(Date.parse(date))
  time.setTime(time.setHours(time.getHours()))
  const Y = time.getFullYear() + '-'
  const M = addZero(time.getMonth() + 1) + '-'
  const D = addZero(time.getDate()) + ' '
  const h = addZero(time.getHours()) + ':'
  const m = addZero(time.getMinutes()) + ':'
  const s = addZero(time.getSeconds())
  return Y + M + D + h + m + s
}
