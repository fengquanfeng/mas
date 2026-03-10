/**
 * API 入口文件
 * 自动导入所有 API 模块
 * 
 * 使用方式：
 * import API from '@/api'
 * const { dicApi } = API
 * 
 * 或在组件中：
 * const { proxy } = getCurrentInstance()
 * const $API = proxy.$API  // 包含所有 API 模块
 */

const modules = {}

// ==================== 旧版本兼容（model 目录）====================
// 同步导入 src/api/model/ 下所有 .js 文件
const modelFiles = import.meta.glob('./model/*.js', { eager: true })

Object.keys(modelFiles).forEach((key) => {
  // 解析模块名：./model/common.js → common
  const moduleName = key.replace(/(\.\/model\/|\.js)/g, '')
  // 挂载默认导出
  modules[moduleName] = modelFiles[key].default
})

// ==================== 新版本（modules 目录）====================
// 同步导入 src/api/modules/ 下所有 .js 文件
const moduleFiles = import.meta.glob('./modules/*.js', { eager: true })

Object.keys(moduleFiles).forEach((key) => {
  // 解析模块名：./modules/dic.js → dic
  const moduleName = key.replace(/(\.\/modules\/|\.js)/g, '')
  const module = moduleFiles[key]
  
  // 优先使用命名导出（如 dicApi），否则使用默认导出
  const apiName = moduleName + 'Api'
  modules[apiName] = module[apiName] || module.default || module
})

// 导出结构：{ common: {...}, dicApi: {...}, ... }
export default modules

// ==================== 单独导出常用模块（方便按需导入）====================
export { dicApi, dicFieldMapping } from './modules/dic'
