/**
 * API 工厂函数
 * 用于统一创建 API 接口对象
 */

import http from '@/utils/request'
import config from '@/config'

/**
 * 创建 API 对象
 * @param {string} baseUrl - 基础 URL 路径
 * @param {Object} endpoints - 端点配置
 * @returns {Object} API 对象
 * 
 * 使用示例：
 * const dicApi = createApi('/dic', {
 *   tree: { path: '/tree', name: '获取字典树', method: 'get' },
 *   create: { path: '', name: '创建字典', method: 'post' }
 * })
 * 
 * // 调用方式
 * dicApi.tree.request() 或 dicApi.tree.get()
 * dicApi.create.request(data) 或 dicApi.create.post(data)
 */
export function createApi(baseUrl, endpoints) {
  const api = {}

  for (const [key, endpoint] of Object.entries(endpoints)) {
    const url = `${config.API_URL}${baseUrl}${endpoint.path}`

    api[key] = {
      url,
      name: endpoint.name,
      method: endpoint.method || 'get',

      /**
       * 通用请求方法
       * @param {Object} data - 请求数据
       * @param {Object} options - 请求选项
       * @returns {Promise} 请求结果
       */
      request: async (data, options = {}) => {
        const method = endpoint.method?.toLowerCase() || 'get'
        const isGet = method === 'get'

        // 替换 URL 中的参数，如 :id
        let finalUrl = url
        const urlParams = {}
        
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            if (finalUrl.includes(`:${key}`)) {
              finalUrl = finalUrl.replace(`:${key}`, encodeURIComponent(data[key]))
            } else if (isGet) {
              // GET 请求的非 URL 参数放入 query
              urlParams[key] = data[key]
            }
          })
        }

        // GET 请求参数放在 params，其他放在 data
        if (isGet) {
          return await http.get(finalUrl, { params: urlParams, ...options })
        } else {
          // POST/PUT/DELETE 请求，过滤掉已用于 URL 的参数
          const bodyData = {}
          if (data && typeof data === 'object') {
            Object.keys(data).forEach(key => {
              if (!url.includes(`:${key}`)) {
                bodyData[key] = data[key]
              }
            })
          }
          return await http[method](finalUrl, bodyData, options)
        }
      }
    }

    // 快捷方法别名
    api[key].get = api[key].request
    api[key].post = api[key].request
    api[key].put = api[key].request
    api[key].delete = api[key].request
  }

  return api
}

/**
 * 创建 CRUD API
 * @param {string} baseUrl - 基础 URL
 * @param {string} name - 模块名称（用于接口描述）
 * @returns {Object} CRUD API 对象
 * 
 * 使用示例：
 * const userApi = createCrudApi('/users', '用户')
 * 
 * // 自动生成以下接口：
 * // userApi.list    - GET    /users
 * // userApi.detail  - GET    /users/:id
 * // userApi.create  - POST   /users
 * // userApi.update  - PUT    /users/:id
 * // userApi.delete  - DELETE /users/:id
 */
export function createCrudApi(baseUrl, name) {
  return createApi(baseUrl, {
    list: { path: '', name: `获取${name}列表`, method: 'get' },
    detail: { path: '/:id', name: `获取${name}详情`, method: 'get' },
    create: { path: '', name: `创建${name}`, method: 'post' },
    update: { path: '/:id', name: `更新${name}`, method: 'put' },
    delete: { path: '/:id', name: `删除${name}`, method: 'delete' }
  })
}

/**
 * 创建树形结构 API
 * @param {string} baseUrl - 基础 URL
 * @param {string} name - 模块名称
 * @returns {Object} 树形 API 对象
 */
export function createTreeApi(baseUrl, name) {
  return createApi(baseUrl, {
    tree: { path: '/tree', name: `获取${name}树`, method: 'get' },
    list: { path: '', name: `获取${name}列表`, method: 'get' },
    detail: { path: '/:id', name: `获取${name}详情`, method: 'get' },
    create: { path: '', name: `创建${name}`, method: 'post' },
    update: { path: '/:id', name: `更新${name}`, method: 'put' },
    delete: { path: '/:id', name: `删除${name}`, method: 'delete' }
  })
}
