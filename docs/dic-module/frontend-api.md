# DIC 字典模块前端 API 文档

> 版本：v1.2.0 | 日期：2026-03-10 | 技术栈：Vue3@3.4.0、Vite@5.0.0、Element Plus@2.5.0

---

## 一、前端 API 架构设计

### 1.1 架构概述

前端 API 层采用「工厂函数 + 模块分离」架构，核心设计原则：

- **工厂函数封装**：通过 `createApi` 和 `createCrudApi` 统一创建 API 对象
- **模块分离**：按业务模块拆分 API 定义，便于维护
- **自动挂载**：通过 Vite 的 `import.meta.glob` 自动收集所有模块
- **全局访问**：通过 Vue 全局属性 `$API` 在各组件中调用

### 1.2 目录结构

```
frontend/src/
├── api/
│   ├── index.js              # API 入口，自动收集所有模块
│   ├── model/                # 业务模块 API 定义（旧架构）
│   │   ├── system.js         # 系统模块（含字典相关）
│   │   ├── auth.js           # 认证模块
│   │   └── common.js         # 通用模块
│   └── modules/              # 新架构：模块分离目录
│       └── dic.js            # 字典模块 API（待创建）
├── core/
│   └── api-factory.js        # API 工厂函数（待创建）
├── utils/
│   └── request.js            # HTTP 请求封装（axios）
└── views/setting/dic/        # 字典页面
    ├── index.vue             # 字典管理主页面
    ├── dic.vue               # 字典分类弹窗
    └── list.vue              # 字典项弹窗
```

### 1.3 架构对比

| 维度 | 旧架构（model/） | 新架构（modules/ + factory） |
|------|------------------|------------------------------|
| 代码复用 | 每个接口单独定义 | 工厂函数统一生成 CRUD |
| 维护成本 | 高，重复代码多 | 低，配置化生成 |
| 扩展性 | 差，新增接口需写大量模板代码 | 好，支持自定义扩展 |
| 类型支持 | 弱 | 强，可结合 TypeScript |
| 学习成本 | 低 | 中等 |

---

## 二、API 工厂函数说明

### 2.1 createApi - 基础 API 创建

**功能**：创建单个 API 端点对象

**文件路径**：`frontend/src/core/api-factory.js`

**参数说明**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| url | string | 是 | API 路径（不含 baseURL） |
| name | string | 否 | API 名称，用于调试 |
| methods | string[] | 否 | 支持的 HTTP 方法，默认 ['get'] |

**返回值**：API 对象，包含指定的方法函数

**代码实现**：

```javascript
import http from '@/utils/request'
import config from '@/config'

/**
 * 创建单个 API 端点
 * @param {string} url - API 路径
 * @param {string} name - API 名称
 * @param {string[]} methods - 支持的 HTTP 方法
 * @returns {Object} API 对象
 */
export function createApi(url, name = '', methods = ['get']) {
  const fullUrl = `${config.API_URL}${url}`
  const api = {
    url: fullUrl,
    name: name || url
  }

  methods.forEach(method => {
    api[method] = async function(data = {}, config = {}) {
      const methodUpper = method.toUpperCase()
      switch (methodUpper) {
        case 'GET':
          return await http.get(this.url, data, config)
        case 'POST':
          return await http.post(this.url, data, config)
        case 'PUT':
          return await http.put(this.url, data, config)
        case 'DELETE':
          return await http.delete(this.url, data, config)
        case 'PATCH':
          return await http.patch(this.url, data, config)
        default:
          throw new Error(`不支持的 HTTP 方法: ${method}`)
      }
    }
  })

  return api
}
```

**使用示例**：

```javascript
// 创建获取字典树 API
const dicTreeApi = createApi('/dic/tree', '获取字典树', ['get'])

// 调用
const res = await dicTreeApi.get()
```

---

### 2.2 createCrudApi - CRUD API 批量创建

**功能**：批量创建标准的增删改查 API

**参数说明**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| baseUrl | string | 是 | 基础路径（不含 baseURL） |
| name | string | 否 | API 模块名称 |
| options | Object | 否 | 扩展配置 |
| options.custom | Object | 否 | 自定义 API 配置 |

**返回值**：包含标准 CRUD 方法的对象

**代码实现**：

```javascript
/**
 * 创建标准 CRUD API
 * @param {string} baseUrl - 基础路径
 * @param {string} name - 模块名称
 * @param {Object} options - 配置选项
 * @returns {Object} CRUD API 对象
 */
export function createCrudApi(baseUrl, name = '', options = {}) {
  const fullBaseUrl = `${config.API_URL}${baseUrl}`
  const api = {
    name: name || baseUrl,
    
    // 列表查询
    list: {
      url: fullBaseUrl,
      name: `${name}-列表`,
      get: async function(params = {}) {
        return await http.get(this.url, params)
      }
    },
    
    // 详情查询
    detail: {
      url: `${fullBaseUrl}/:id`,
      name: `${name}-详情`,
      get: async function(id) {
        return await http.get(this.url.replace(':id', id))
      }
    },
    
    // 创建
    create: {
      url: fullBaseUrl,
      name: `${name}-创建`,
      post: async function(data = {}) {
        return await http.post(this.url, data)
      }
    },
    
    // 更新
    update: {
      url: `${fullBaseUrl}/:id`,
      name: `${name}-更新`,
      put: async function(id, data = {}) {
        return await http.put(this.url.replace(':id', id), data)
      }
    },
    
    // 删除
    delete: {
      url: `${fullBaseUrl}/:id`,
      name: `${name}-删除`,
      delete: async function(id) {
        return await http.delete(this.url.replace(':id', id))
      }
    }
  }

  // 合并自定义 API
  if (options.custom) {
    Object.assign(api, options.custom)
  }

  return api
}
```

**使用示例**：

```javascript
// 创建字典项 CRUD API
const dicItemApi = createCrudApi('/dic/items', '字典项', {
  custom: {
    // 排序更新
    sort: {
      url: `${config.API_URL}/dic/items/:id/sort`,
      name: '字典项-排序',
      put: async function(id, orderNum) {
        return await http.put(this.url.replace(':id', id), { orderNum })
      }
    },
    // 状态更新
    status: {
      url: `${config.API_URL}/dic/items/:id/status`,
      name: '字典项-状态',
      put: async function(id, status) {
        return await http.put(this.url.replace(':id', id), { status })
      }
    }
  }
})
```

---

## 三、字典模块 API 定义

### 3.1 完整 API 定义（dic.js）

**文件路径**：`frontend/src/api/modules/dic.js`

**代码实现**：

```javascript
import config from '@/config'
import http from '@/utils/request'
import { createApi, createCrudApi } from '@/core/api-factory'

/**
 * 字典模块 API
 * 基础路径：/api/dic
 */
export default {
  // ==================== 字典分类 API ====================
  
  /**
   * 获取字典树
   * GET /api/dic/tree
   */
  tree: createApi('/dic/tree', '获取字典树', ['get']),
  
  /**
   * 获取字典详情
   * GET /api/dic/:code
   */
  detail: {
    url: `${config.API_URL}/dic/:code`,
    name: '获取字典详情',
    get: async function(code) {
      return await http.get(this.url.replace(':code', code))
    }
  },
  
  /**
   * 创建字典
   * POST /api/dic
   */
  create: {
    url: `${config.API_URL}/dic`,
    name: '创建字典',
    post: async function(data) {
      return await http.post(this.url, data)
    }
  },
  
  /**
   * 更新字典
   * PUT /api/dic/:id
   */
  update: {
    url: `${config.API_URL}/dic/:id`,
    name: '更新字典',
    put: async function(id, data) {
      return await http.put(this.url.replace(':id', id), data)
    }
  },
  
  /**
   * 删除字典
   * DELETE /api/dic/:id
   */
  delete: {
    url: `${config.API_URL}/dic/:id`,
    name: '删除字典',
    delete: async function(id) {
      return await http.delete(this.url.replace(':id', id))
    }
  },
  
  // ==================== 字典项 API ====================
  
  /**
   * 获取字典项列表
   * GET /api/dic/:code/items
   */
  items: {
    url: `${config.API_URL}/dic/:code/items`,
    name: '获取字典项列表',
    get: async function(code) {
      return await http.get(this.url.replace(':code', code))
    }
  },
  
  /**
   * 创建字典项
   * POST /api/dic/items
   */
  createItem: {
    url: `${config.API_URL}/dic/items`,
    name: '创建字典项',
    post: async function(data) {
      return await http.post(this.url, data)
    }
  },
  
  /**
   * 更新字典项
   * PUT /api/dic/items/:id
   */
  updateItem: {
    url: `${config.API_URL}/dic/items/:id`,
    name: '更新字典项',
    put: async function(id, data) {
      return await http.put(this.url.replace(':id', id), data)
    }
  },
  
  /**
   * 删除字典项
   * DELETE /api/dic/items/:id
   */
  deleteItem: {
    url: `${config.API_URL}/dic/items/:id`,
    name: '删除字典项',
    delete: async function(id) {
      return await http.delete(this.url.replace(':id', id))
    }
  },
  
  /**
   * 更新字典项排序
   * PUT /api/dic/items/:id/sort
   */
  sortItem: {
    url: `${config.API_URL}/dic/items/:id/sort`,
    name: '更新字典项排序',
    put: async function(id, orderNum) {
      return await http.put(this.url.replace(':id', id), { orderNum })
    }
  },
  
  /**
   * 更新字典项状态
   * PUT /api/dic/items/:id/status
   */
  statusItem: {
    url: `${config.API_URL}/dic/items/:id/status`,
    name: '更新字典项状态',
    put: async function(id, status) {
      return await http.put(this.url.replace(':id', id), { status })
    }
  }
}
```

### 3.2 API 汇总表

| API 名称 | 路径 | 方法 | 说明 |
|----------|------|------|------|
| tree | /dic/tree | GET | 获取字典树 |
| detail | /dic/:code | GET | 获取字典详情 |
| create | /dic | POST | 创建字典 |
| update | /dic/:id | PUT | 更新字典 |
| delete | /dic/:id | DELETE | 删除字典 |
| items | /dic/:code/items | GET | 获取字典项列表 |
| createItem | /dic/items | POST | 创建字典项 |
| updateItem | /dic/items/:id | PUT | 更新字典项 |
| deleteItem | /dic/items/:id | DELETE | 删除字典项 |
| sortItem | /dic/items/:id/sort | PUT | 更新字典项排序 |
| statusItem | /dic/items/:id/status | PUT | 更新字典项状态 |

---

## 四、接口调用示例

### 4.1 获取字典树

```javascript
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const $API = proxy.$API

// 调用示例
const getDicTree = async () => {
  try {
    const res = await $API.dic.tree.get()
    if (res.code === 200) {
      console.log('字典树数据：', res.data)
      return res.data
    }
  } catch (error) {
    console.error('获取字典树失败：', error)
  }
}
```

### 4.2 获取字典详情

```javascript
// 根据字典编码获取详情
const getDicDetail = async (code) => {
  const res = await $API.dic.detail.get(code)
  if (res.code === 200) {
    console.log('字典详情：', res.data)
    return res.data
  }
}

// 使用示例
getDicDetail('user_status')
```

### 4.3 创建字典

```javascript
// 创建字典分类（code 不传则自动生成）
const createDictionary = async () => {
  const data = {
    name: '用户类型'
    // code 可选，不传则由后端根据名称自动生成拼音编码
  }
  
  const res = await $API.dic.create.post(data)
  if (res.code === 201) {
    ElMessage.success('创建成功')
    return res.data
  }
}
```

### 4.4 更新字典

```javascript
// 更新字典
const updateDictionary = async (id) => {
  const data = {
    name: '用户类型（已修改）',
    code: 'user_type_v2'
  }
  
  const res = await $API.dic.update.put(id, data)
  if (res.code === 200) {
    ElMessage.success('更新成功')
    return res.data
  }
}
```

### 4.5 删除字典

```javascript
// 删除字典
const deleteDictionary = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该字典吗？', '提示', {
      type: 'warning'
    })
    
    const res = await $API.dic.delete.delete(id)
    if (res.code === 204) {
      ElMessage.success('删除成功')
    }
  } catch (error) {
    // 用户取消或删除失败
  }
}
```

### 4.6 获取字典项列表

```javascript
// 获取指定字典下的所有字典项
const getDicItems = async (code) => {
  const res = await $API.dic.items.get(code)
  if (res.code === 200) {
    console.log('字典项列表：', res.data)
    return res.data
  }
}

// 使用示例
getDicItems('user_status')
```

### 4.7 创建字典项

```javascript
// 创建字典项
const createDicItem = async () => {
  const data = {
    id: 'ut_001',
    dictionaryId: 'user_type',
    name: '普通用户',
    value: '1',
    orderNum: 0,
    status: 1
  }
  
  const res = await $API.dic.createItem.post(data)
  if (res.code === 201) {
    ElMessage.success('创建成功')
    return res.data
  }
}
```

### 4.8 更新字典项

```javascript
// 更新字典项
const updateDicItem = async (id) => {
  const data = {
    name: 'VIP用户',
    value: '2'
  }
  
  const res = await $API.dic.updateItem.put(id, data)
  if (res.code === 200) {
    ElMessage.success('更新成功')
    return res.data
  }
}
```

### 4.9 删除字典项

```javascript
// 删除字典项
const deleteDicItem = async (id) => {
  const res = await $API.dic.deleteItem.delete(id)
  if (res.code === 204) {
    ElMessage.success('删除成功')
  }
}
```

### 4.10 更新字典项排序

```javascript
// 更新排序
const updateItemSort = async (id, newOrder) => {
  const res = await $API.dic.sortItem.put(id, newOrder)
  if (res.code === 200) {
    ElMessage.success('排序更新成功')
    return res.data
  }
}

// 使用示例（拖拽排序后）
updateItemSort('ut_001', 5)
```

### 4.11 更新字典项状态

```javascript
// 更新状态（启用/禁用）
const updateItemStatus = async (id, status) => {
  // status: 0-禁用, 1-启用
  const res = await $API.dic.statusItem.put(id, status)
  if (res.code === 200) {
    ElMessage.success(status === 1 ? '已启用' : '已禁用')
    return res.data
  }
}

// 使用示例
updateItemStatus('ut_001', 0)  // 禁用
updateItemStatus('ut_001', 1)  // 启用
```

---

## 五、字段映射说明

### 5.1 前端与后端字段对照

| 前端字段 | 后端字段 | 说明 | 映射方向 |
|----------|----------|------|----------|
| key | value | 字典项值 | 双向映射 |
| yx | status | 是否有效（0-禁用，1-启用） | 双向映射 |
| dic | dictionaryId | 所属字典ID | 请求时映射 |
| name | name | 名称 | 一致 |
| code | code | 字典编码 | 一致 |
| id | id | 唯一标识 | 一致 |
| orderNum | orderNum | 排序序号 | 一致 |

### 5.2 字段映射工具函数

```javascript
/**
 * 前端数据转后端格式
 * @param {Object} frontendData - 前端表单数据
 * @returns {Object} 后端接收格式
 */
export function toBackendFormat(frontendData) {
  return {
    id: frontendData.id,
    dictionaryId: frontendData.dic,
    name: frontendData.name,
    value: frontendData.key,
    orderNum: frontendData.orderNum || 0,
    status: parseInt(frontendData.yx) || 1
  }
}

/**
 * 后端数据转前端格式
 * @param {Object} backendData - 后端返回数据
 * @returns {Object} 前端展示格式
 */
export function toFrontendFormat(backendData) {
  return {
    id: backendData.id,
    dic: backendData.dictionaryId,
    name: backendData.name,
    key: backendData.value,
    orderNum: backendData.orderNum,
    yx: String(backendData.status)
  }
}
```

### 5.3 映射使用示例

```javascript
// 表单提交前转换
const submitForm = async () => {
  const backendData = toBackendFormat(form.value)
  const res = await $API.dic.createItem.post(backendData)
  // ...
}

// 数据回显时转换
const setFormData = (rowData) => {
  const frontendData = toFrontendFormat(rowData)
  Object.assign(form.value, frontendData)
}
```

---

## 六、错误处理规范

### 6.1 统一错误处理

API 层统一处理以下错误场景：

| 状态码 | 错误类型 | 处理方式 |
|--------|----------|----------|
| 400 | 请求参数错误 | ElMessage.error 提示具体错误信息 |
| 401 | 未授权 | 跳转登录页或刷新 Token |
| 404 | 资源不存在 | ElMessage.warning 提示资源不存在 |
| 409 | 数据冲突 | ElMessage.warning 提示冲突原因 |
| 500 | 服务器错误 | ElNotification.error 提示服务器错误 |

### 6.2 请求拦截器错误处理

```javascript
// utils/request.js 中已统一处理
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          ElNotification.error({
            title: '请求错误',
            message: 'Status:404，正在请求不存在的服务器记录！'
          })
          break
        case 500:
          ElNotification.error({
            title: '请求错误',
            message: error.response.data.message || 'Status:500，服务器发生错误！'
          })
          break
        case 401:
          // 401 统一处理：提示重新登录
          if (!MessageBox_401_show) {
            MessageBox_401_show = true
            ElMessageBox.confirm('当前用户已被登出或无权限访问当前资源，请尝试重新登录后再操作。', '无权限访问', {
              type: 'error',
              closeOnClickModal: false,
              center: true,
              confirmButtonText: '重新登录'
            }).then(() => {
              router.replace({ path: '/login' })
            })
          }
          break
      }
    }
    return Promise.reject(error.response)
  }
)
```

### 6.3 业务层错误处理建议

```javascript
// 页面中调用 API 时的错误处理
const handleApiCall = async () => {
  try {
    const res = await $API.dic.create.post(data)
    if (res.code === 201) {
      ElMessage.success('创建成功')
      return res.data
    } else {
      // 业务错误
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    // 网络错误或服务器错误（已在拦截器处理）
    console.error('API 调用失败：', error)
  }
}
```

---

## 七、页面集成指南

### 7.1 在页面中使用 API

#### 7.1.1 获取 $API 实例

```javascript
<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const $API = proxy.$API
</script>
```

#### 7.1.2 字典树页面集成（index.vue）

```javascript
// 加载字典树
const getDic = async () => {
  showDicloading.value = true
  try {
    const res = await $API.dic.tree.get()
    showDicloading.value = false
    dicList.value = res.data
    
    // 默认选中第一个节点
    const firstNode = dicList.value[0]
    if (firstNode) {
      nextTick(() => {
        dic.value.setCurrentKey(firstNode.id)
      })
      // 加载对应字典项列表
      listApiParams.value = { code: firstNode.code }
      listApi.value = $API.dic.items
    }
  } catch (error) {
    showDicloading.value = false
  }
}

// 字典点击事件
const dicClick = (data) => {
  table.value.reload({ code: data.code })
}

// 删除字典
const dicDel = async (node, data) => {
  try {
    await ElMessageBox.confirm(`确定删除 ${data.name} 项吗？`, '提示', {
      type: 'warning'
    })
    showDicloading.value = true
    await $API.dic.delete.delete(data.id)
    
    // 更新树节点
    dic.value.remove(data.id)
    ElMessage.success('删除成功')
    showDicloading.value = false
  } catch (error) {
    showDicloading.value = false
  }
}
```

#### 7.1.3 字典项弹窗集成（list.vue）

```javascript
// 表单提交
const submit = () => {
  dialogForm.value.validate(async (valid) => {
    if (!valid) return
    
    isSaveing.value = true
    try {
      // 字段映射：yx -> status, key -> value, dic -> dictionaryId
      const submitData = {
        id: form.id,
        dictionaryId: form.dic,
        name: form.name,
        value: form.key,
        status: parseInt(form.yx)
      }
      
      const api = mode.value === 'add' 
        ? $API.dic.createItem.post(submitData)
        : $API.dic.updateItem.put(form.id, submitData)
        
      const res = await api
      isSaveing.value = false
      
      if (res.code === 200 || res.code === 201) {
        emit('success', form, mode.value)
        visible.value = false
        ElMessage.success('操作成功')
      } else {
        ElMessageBox.alert(res.message, '提示', { type: 'error' })
      }
    } catch (error) {
      isSaveing.value = false
    }
  })
}
```

#### 7.1.4 状态切换集成

```javascript
// 开关状态改变
const changeSwitch = async (val, row) => {
  // 显示加载状态
  row.$switch_yx = true
  
  try {
    // 调用状态更新 API
    const res = await $API.dic.statusItem.put(row.id, parseInt(val))
    delete row.$switch_yx
    
    if (res.code === 200) {
      row.yx = val
      ElMessage.success('操作成功')
    } else {
      // 恢复原值
      row.yx = row.yx === '1' ? '0' : '1'
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    delete row.$switch_yx
    // 恢复原值
    row.yx = row.yx === '1' ? '0' : '1'
  }
}
```

### 7.2 scTable 组件集成

```vue
<template>
  <scTable 
    ref="table" 
    :apiObj="listApi" 
    row-key="id" 
    :params="listApiParams"
    @selection-change="selectionChange" 
    stripe 
    :paginationLayout="'prev, pager, next'">
    <!-- 列定义 -->
  </scTable>
</template>

<script setup>
const listApi = ref(null)
const listApiParams = ref({})

// 初始化时设置 API
onMounted(() => {
  listApiParams.value = { code: 'user_status' }
  listApi.value = $API.dic.items
})
</script>
```

### 7.3 模块注册

#### 7.3.1 更新 api/index.js

```javascript
// src/api/index.js（Vite 替代 Webpack 的 require.context）
const modules = {};

// 同步导入 src/api/modules/ 下所有 .js 文件
const files = import.meta.glob('./modules/*.js', { eager: true });

Object.keys(files).forEach((key) => {
  const moduleName = key.replace(/(\.modules|\.js)/g, '');
  modules[moduleName] = files[key].default;
});

// 保留旧架构兼容
const oldFiles = import.meta.glob('./model/*.js', { eager: true });
Object.keys(oldFiles).forEach((key) => {
  const moduleName = key.replace(/(\.model|\.js)/g, '');
  if (!modules[moduleName]) {
    modules[moduleName] = oldFiles[key].default;
  }
});

export default modules;
```

---

## 八、页面组件变更

### 8.1 dic.vue 字典弹窗组件

**文件路径**：`frontend/src/views/setting/dic/dic.vue`

**变更内容**：

| 变更项 | 修改前 | 修改后 |
|--------|--------|--------|
| 父路径选择 | 显示树形选择器 | **隐藏**，不做树形结构 |
| code 输入框 | 新增/编辑均可输入 | 新增时**隐藏**，编辑时**只读显示** |
| 名称校验 | 仅必填校验 | 新增**存在性校验**（前端校验名称是否重复） |

**表单配置变更**：

```javascript
// 修改前：新增时显示 code 输入框
form: {
  id: '',
  name: '',
  code: '',
  parentId: null
}

// 修改后：新增时无需传 id 和 code
form: {
  name: '',
  // code 由后端自动生成
}
```

**校验规则变更**：

```javascript
// 新增名称存在性校验
const rules = {
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { 
      validator: async (rule, value, callback) => {
        // 新增时校验名称是否已存在
        if (mode.value === 'add') {
          const exists = await checkNameExists(value)
          if (exists) {
            callback(new Error('字典名称已存在'))
            return
          }
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}
```

**模板变更**：

```vue
<!-- 父路径选择：已隐藏 -->
<!-- <el-form-item label="父路径" prop="parentId">...</el-form-item> -->

<!-- code 输入框：新增时隐藏，编辑时只读 -->
<el-form-item v-if="mode === 'edit'" label="字典编码">
  <el-input v-model="form.code" disabled />
</el-form-item>
```

---

## 九、迭代变更记录

### v1.2.0（2026-03-10）

**修改内容**：
- **dic.vue**：
  - 隐藏父路径选择（不做树形结构）
  - code 输入框：新增时隐藏，编辑时只读显示
  - 新增字典名称存在性校验（前端校验）

**修改前/修改后对比**：

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| 父路径选择 | 显示 | 隐藏 |
| code 输入（新增） | 必填输入 | 隐藏，后端自动生成 |
| code 输入（编辑） | 可编辑 | 只读显示 |
| 名称校验 | 仅必填 | 新增存在性校验 |

---

### v1.0.0（2026-03-10）

**新增内容**：
- 前端 API 架构设计说明（工厂函数 + 模块分离）
- API 工厂函数说明（createApi、createCrudApi）
- 字典模块完整 API 定义（11 个接口）
- 接口调用示例（11 个接口的调用代码）
- 字段映射说明（前端字段与后端字段对照表）
- 错误处理规范（统一错误处理方式）
- 页面集成指南（各页面 API 使用示例）

**技术栈版本**：
- Vue@3.4.0
- Vite@5.0.0
- Element Plus@2.5.0
- Axios@1.6.0

---

**本次更新模块**：dic（字典模块前端 API）

> 文档路径：`docs/dic