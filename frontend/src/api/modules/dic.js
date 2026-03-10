/**
 * 字典模块 API
 * 提供字典分类和字典项的增删改查接口
 */

import { createApi } from '../core/api-factory'

/**
 * 字典模块 API 对象
 * 
 * 使用方式：
 * import { dicApi } from '@/api/modules/dic'
 * 或
 * const { dicApi } = proxy.$API
 * 
 * // 调用示例
 * dicApi.tree.request()                           // 获取字典树
 * dicApi.create.request({ name, code })           // 创建字典
 * dicApi.itemList.request({ code: 'gender' })     // 获取字典项列表
 * dicApi.itemCreate.request({ dictionaryId, name, value })  // 创建字典项
 */
export const dicApi = createApi('/dic', {
  // ==================== 字典分类接口 ====================
  
  /**
   * 获取字典树
   * 返回树形结构的字典列表
   */
  tree: { 
    path: '/tree', 
    name: '获取字典树', 
    method: 'get' 
  },
  
  /**
   * 获取字典详情
   * @param {string} code - 字典编码
   */
  detail: { 
    path: '/:code', 
    name: '获取字典详情', 
    method: 'get' 
  },
  
  /**
   * 创建字典
   * @param {Object} data - { id, name, code, parentId? }
   */
  create: { 
    path: '', 
    name: '创建字典', 
    method: 'post' 
  },
  
  /**
   * 更新字典
   * @param {string} id - 字典ID
   * @param {Object} data - { name?, code?, parentId? }
   */
  update: { 
    path: '/:id', 
    name: '更新字典', 
    method: 'put' 
  },
  
  /**
   * 删除字典
   * @param {string} id - 字典ID
   */
  delete: { 
    path: '/:id', 
    name: '删除字典', 
    method: 'delete' 
  },

  // ==================== 字典项接口 ====================
  
  /**
   * 获取字典项列表
   * @param {string} code - 字典编码
   */
  itemList: { 
    path: '/:code/items', 
    name: '获取字典项列表', 
    method: 'get' 
  },
  
  /**
   * 获取字典项详情
   * @param {string} id - 字典项ID
   */
  itemDetail: { 
    path: '/items/:id', 
    name: '获取字典项详情', 
    method: 'get' 
  },
  
  /**
   * 创建字典项
   * @param {Object} data - { id, dictionaryId, name, value, orderNum?, status? }
   */
  itemCreate: { 
    path: '/items', 
    name: '创建字典项', 
    method: 'post' 
  },
  
  /**
   * 更新字典项
   * @param {string} id - 字典项ID
   * @param {Object} data - { dictionaryId?, name?, value?, orderNum?, status? }
   */
  itemUpdate: { 
    path: '/items/:id', 
    name: '更新字典项', 
    method: 'put' 
  },
  
  /**
   * 删除字典项
   * @param {string} id - 字典项ID
   */
  itemDelete: { 
    path: '/items/:id', 
    name: '删除字典项', 
    method: 'delete' 
  },
  
  /**
   * 更新字典项排序
   * @param {string} id - 字典项ID
   * @param {number} orderNum - 排序号
   */
  itemSort: { 
    path: '/items/:id/sort', 
    name: '更新字典项排序', 
    method: 'put' 
  },
  
  /**
   * 更新字典项状态
   * @param {string} id - 字典项ID
   * @param {number} status - 状态（0-禁用，1-启用）
   */
  itemStatus: { 
    path: '/items/:id/status', 
    name: '更新字典项状态', 
    method: 'put' 
  }
})

/**
 * 字段映射工具函数
 * 用于前端字段与后端字段的转换
 */
export const dicFieldMapping = {
  /**
   * 前端表单数据转后端提交数据
   * @param {Object} formData - 前端表单数据
   * @returns {Object} 后端提交数据
   */
  toBackend(formData) {
    return {
      ...formData,
      // 字段映射
      value: formData.key,           // 前端 key -> 后端 value
      status: parseInt(formData.yx || '1'),  // 前端 yx -> 后端 status
      dictionaryId: formData.dic     // 前端 dic -> 后端 dictionaryId
    }
  },

  /**
   * 后端数据转前端展示数据
   * @param {Object} backendData - 后端返回数据
   * @returns {Object} 前端展示数据
   */
  toFrontend(backendData) {
    return {
      ...backendData,
      // 字段映射
      key: backendData.value,        // 后端 value -> 前端 key
      yx: String(backendData.status), // 后端 status -> 前端 yx
      dic: backendData.dictionaryId  // 后端 dictionaryId -> 前端 dic
    }
  }
}

export default dicApi
