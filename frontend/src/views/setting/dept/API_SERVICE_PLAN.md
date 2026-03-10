# 方案C - 基于现有 Axios 的 API Service 封装方案

## 一、方案概述

使用项目现有的 Axios 封装（`src/utils/request.js`），创建独立的 Service 层管理 API 接口。

**核心思想**:
- 每个业务模块一个 Service 文件
- 使用 JS + JSDoc 实现类似 TypeScript 的类型提示
- 统一错误处理、加载状态管理
- 便于单元测试和复用

---

## 二、目录结构

```
src/
├── api/
│   ├── index.js              # API 入口（保持现有）
│   ├── model/                # 现有 API 配置
│   │   ├── system.js
│   │   └── ...
│   └── services/             # 新增：Service 层
│       ├── deptService.js    # 部门服务
│       ├── userService.js    # 用户服务
│       └── index.js          # Service 统一导出
├── utils/
│   └── request.js            # 现有 Axios 封装
```

---

## 三、实现步骤

### 步骤1：创建 Service 目录

```bash
mkdir src/api/services
```

### 步骤2：创建 deptService.js

```javascript
/**
 * 部门管理服务
 * @module services/deptService
 */

import http from '@/utils/request'

/**
 * 部门对象
 * @typedef {Object} Dept
 * @property {string} id - 部门ID
 * @property {string} parentId - 上级部门ID
 * @property {string} label - 部门名称
 * @property {number} sort - 排序
 * @property {number} status - 状态 1-启用 0-停用
 * @property {string} remark - 备注
 * @property {string} date - 创建时间
 * @property {Dept[]} [children] - 子部门
 */

/**
 * API 响应对象
 * @typedef {Object} ApiResponse
 * @property {number} code - 状态码 200-成功
 * @property {string} message - 消息
 * @property {T} data - 数据
 * @template T
 */

/**
 * 查询参数
 * @typedef {Object} DeptQuery
 * @property {string} [keyword] - 搜索关键词
 * @property {number} [page] - 页码
 * @property {number} [size] - 每页条数
 */

/**
 * 基础URL
 * @constant {string}
 */
const BASE_URL = '/system/dept'

/**
 * 部门服务 API
 */
export const deptApi = {
  /**
   * 获取部门列表（树形）
   * @param {DeptQuery} [params] - 查询参数
   * @returns {Promise<ApiResponse<Dept[]>>}
   * @example
   * const res = await deptApi.getList({ keyword: '技术' })
   * if (res.code === 200) {
   *   console.log(res.data) // 部门树
   * }
   */
  getList(params) {
    return http.get(`${BASE_URL}/list`, params)
  },

  /**
   * 获取部门详情
   * @param {string} id - 部门ID
   * @returns {Promise<ApiResponse<Dept>>}
   */
  getById(id) {
    return http.get(`${BASE_URL}/detail`, { id })
  },

  /**
   * 新增部门
   * @param {Omit<Dept, 'id'|'date'>} data - 部门数据
   * @returns {Promise<ApiResponse<Dept>>}
   * @example
   * const res = await deptApi.create({
   *   parentId: '0',
   *   label: '技术部',
   *   sort: 1,
   *   status: 1,
   *   remark: ''
   * })
   */
  create(data) {
    return http.post(`${BASE_URL}/add`, data)
  },

  /**
   * 编辑部门
   * @param {string} id - 部门ID
   * @param {Partial<Dept>} data - 更新的数据
   * @returns {Promise<ApiResponse<Dept>>}
   */
  update(id, data) {
    return http.post(`${BASE_URL}/edit`, { id, ...data })
  },

  /**
   * 删除部门
   * @param {string} id - 部门ID
   * @returns {Promise<ApiResponse<void>>}
   */
  delete(id) {
    return http.post(`${BASE_URL}/delete`, { id })
  },

  /**
   * 批量删除部门
   * @param {string[]} ids - 部门ID数组
   * @returns {Promise<ApiResponse<void>>}
   * @example
   * await deptApi.batchDelete(['1', '2', '3'])
   */
  batchDelete(ids) {
    return http.post(`${BASE_URL}/batchDelete`, { ids })
  },

  /**
   * 修改部门状态
   * @param {string} id - 部门ID
   * @param {number} status - 状态 1-启用 0-停用
   * @returns {Promise<ApiResponse<void>>}
   */
  updateStatus(id, status) {
    return http.post(`${BASE_URL}/status`, { id, status })
  }
}

/**
 * 部门树形数据转换工具
 */
export const deptUtils = {
  /**
   * 将扁平数组转为树形结构
   * @param {Dept[]} list - 部门列表
   * @param {string} [rootId='0'] - 根节点ID
   * @returns {Dept[]}
   */
  buildTree(list, rootId = '0') {
    const map = {}
    const result = []

    // 先构建 map
    list.forEach(item => {
      map[item.id] = { ...item, children: [] }
    })

    // 再组装树
    list.forEach(item => {
      if (item.parentId === rootId) {
        result.push(map[item.id])
      } else if (map[item.parentId]) {
        map[item.parentId].children.push(map[item.id])
      }
    })

    return result
  },

  /**
   * 查找部门路径
   * @param {Dept[]} tree - 部门树
   * @param {string} id - 目标部门ID
   * @returns {string[]} - 路径名称数组
   */
  findPath(tree, id) {
    const path = []

    const find = (nodes, targetId) => {
      for (const node of nodes) {
        if (node.id === targetId) {
          path.unshift(node.label)
          return true
        }
        if (node.children && find(node.children, targetId)) {
          path.unshift(node.label)
          return true
        }
      }
      return false
    }

    find(tree, id)
    return path
  },

  /**
   * 扁平化部门树
   * @param {Dept[]} tree - 部门树
   * @param {number} [level=0] - 当前层级
   * @returns {Array<{id: string, label: string, level: number}>}
   */
  flatten(tree, level = 0) {
    const result = []

    const flatten = (nodes, lvl) => {
      nodes.forEach(node => {
        result.push({
          id: node.id,
          label: node.label,
          level: lvl
        })
        if (node.children && node.children.length > 0) {
          flatten(node.children, lvl + 1)
        }
      })
    }

    flatten(tree, level)
    return result
  }
}

// 默认导出
export default deptApi
```

### 步骤3：创建 services/index.js（统一导出）

```javascript
/**
 * API Services 统一入口
 * @module services
 */

export { deptApi, deptUtils } from './deptService'
// export { userApi } from './userService'
// export { roleApi } from './roleService'
```

### 步骤4：在组件中使用

#### index.vue 中使用

```vue
<script setup>
import { ref, reactive, nextTick, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { deptApi } from '@/api/services'  // 导入 Service
import SaveDialog from './save.vue'

const { proxy } = getCurrentInstance()

// 数据定义
const dialog = reactive({ save: false })
const selection = ref([])
const search = reactive({ keyword: null })
const table = ref(null)
const saveDialogRef = ref(null)

// 部门列表数据
const deptList = ref([])
const loading = ref(false)

/**
 * 加载部门列表
 */
const loadDeptList = async () => {
  loading.value = true
  try {
    const res = await deptApi.getList({ keyword: search.keyword })
    if (res.code === 200) {
      deptList.value = res.data
    } else {
      ElMessage.error(res.message || '获取列表失败')
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
const searchDept = () => {
  loadDeptList()
}

/**
 * 添加部门
 */
const add = () => {
  dialog.save = true
  nextTick(() => {
    saveDialogRef.value.open('add')
  })
}

/**
 * 表格编辑
 * @param {Object} row - 当前行数据
 */
const table_edit = (row) => {
  dialog.save = true
  nextTick(() => {
    saveDialogRef.value.open('edit').setData(row)
  })
}

/**
 * 表格查看
 * @param {Object} row - 当前行数据
 */
const table_show = (row) => {
  dialog.save = true
  nextTick(() => {
    saveDialogRef.value.open('show').setData(row)
  })
}

/**
 * 表格删除
 * @param {Object} row - 当前行数据
 */
const table_del = async (row) => {
  try {
    const res = await deptApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadDeptList()  // 刷新列表
    } else {
      ElMessageBox.alert(res.message, '提示', { type: 'error' })
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/**
 * 选择改变
 * @param {Array} selection - 选中的行
 */
const selectionChange = (sel) => {
  selection.value = sel
}

/**
 * 批量删除
 */
const batch_del = () => {
  ElMessageBox.confirm(
    `确定删除选中的 ${selection.value.length} 项吗？`,
    '提示',
    { type: 'warning' }
  ).then(async () => {
    const loading = ElLoading.service()
    try {
      const ids = selection.value.map(item => item.id)
      const res = await deptApi.batchDelete(ids)
      if (res.code === 200) {
        ElMessage.success('批量删除成功')
        loadDeptList()
      } else {
        ElMessageBox.alert(res.message, '提示', { type: 'error' })
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    } finally {
      loading.close()
    }
  }).catch(() => {})
}

/**
 * 保存成功回调
 */
const handleSaveSuccess = () => {
  dialog.save = false
  loadDeptList()  // 刷新列表
}

/**
 * 弹窗关闭回调
 */
const handleSaveClosed = () => {
  // 清理工作
}

// 初始化加载
onMounted(() => {
  loadDeptList()
})
</script>
```

#### save.vue 中使用

```vue
<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deptApi } from '@/api/services'  // 导入 Service

const { proxy } = getCurrentInstance()

// 定义事件
const emit = defineEmits(['success', 'closed'])

// 数据定义
const mode = ref('add')
const visible = ref(false)
const isSaveing = ref(false)
const dialogForm = ref(null)

// 表单数据
const form = reactive({
  id: '',
  parentId: '',
  label: '',
  sort: 1,
  status: 1,
  remark: ''
})

// 部门树选项
const deptOptions = ref([])

// 表单验证规则
const rules = {
  label: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

/**
 * 打开对话框
 * @param {string} openMode - 打开模式：add/edit/show
 * @returns {Object} - 返回 setData 方法支持链式调用
 */
const open = (openMode = 'add') => {
  mode.value = openMode
  visible.value = true
  return { setData }
}

/**
 * 设置表单数据
 * @param {Object} data - 部门数据
 */
const setData = (data) => {
  Object.assign(form, data)
}

/**
 * 加载部门树（用于上级部门选择）
 */
const loadDeptTree = async () => {
  try {
    const res = await deptApi.getList()
    if (res.code === 200) {
      deptOptions.value = res.data
    }
  } catch (error) {
    console.error('加载部门树失败:', error)
  }
}

/**
 * 表单提交
 */
const submit = () => {
  dialogForm.value.validate(async (valid) => {
    if (!valid) return

    isSaveing.value = true
    try {
      // 根据模式选择 API
      const api = mode.value === 'add' ? deptApi.create : deptApi.update
      const res = mode.value === 'add'
        ? await api(form)
        : await api(form.id, form)

      if (res.code === 200) {
        ElMessage.success(mode.value === 'add' ? '新增成功' : '编辑成功')
        emit('success', form, mode.value)
        visible.value = false
      } else {
        ElMessageBox.alert(res.message, '提示', { type: 'error' })
      }
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      isSaveing.value = false
    }
  })
}

/**
 * 关闭弹窗
 */
const close = () => {
  visible.value = false
  emit('closed')
}

// 组件挂载时加载部门树
onMounted(() => {
  loadDeptTree()
})

// 暴露方法供父组件调用
defineExpose({ open, setData })
</script>
```

---

## 四、进阶封装（可选）

### 4.1 创建 useApi Hook（组合式函数）

```javascript
/**
 * API 请求组合式函数
 * @module composables/useApi
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 使用 API 请求
 * @template T
 * @param {Function} apiFn - API 函数
 * @returns {Object} - { data, loading, error, execute }
 * @example
 * const { data, loading, execute } = useApi(deptApi.getList)
 * // 调用
 * await execute({ keyword: '技术' })
 */
export function useApi(apiFn) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null

    try {
      const res = await apiFn(...args)
      if (res.code === 200) {
        data.value = res.data
        return res.data
      } else {
        error.value = res.message
        ElMessage.error(res.message)
        throw new Error(res.message)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute
  }
}

/**
 * 使用分页 API 请求
 * @param {Function} apiFn - 分页 API 函数
 * @returns {Object} - 分页相关状态和方法
 */
export function usePagination(apiFn) {
  const list = ref([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const loadData = async (params = {}) => {
    loading.value = true
    try {
      const res = await apiFn({
        page: currentPage.value,
        size: pageSize.value,
        ...params
      })
      if (res.code === 200) {
        list.value = res.data.list || res.data
        total.value = res.data.total || res.data.length
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handlePageChange = (page) => {
    currentPage.value = page
    loadData()
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
    loadData()
  }

  return {
    list,
    loading,
    currentPage,
    pageSize,
    total,
    loadData,
    handlePageChange,
    handleSizeChange
  }
}
```

### 4.2 使用 useApi Hook

```vue
<script setup>
import { deptApi } from '@/api/services'
import { useApi } from '@/composables/useApi'

// 使用 useApi 简化请求逻辑
const { data: deptList, loading, execute: loadDeptList } = useApi(deptApi.getList)

// 初始化加载
onMounted(() => {
  loadDeptList({ keyword: '' })
})
</script>

<template>
  <el-table v-loading="loading" :data="deptList">
    <!-- ... -->
  </el-table>
</template>
```

---

## 五、与现有代码的对比

| 对比项 | 现有方式 | Service 方式 |
|-------|---------|-------------|
| API 定义 | `src/api/model/system.js` | `src/api/services/deptService.js` |
| 使用方式 | `$API.system.dept.list.get()` | `deptApi.getList()` |
| 类型提示 | 无 | JSDoc 提供 |
| 错误处理 | 每个组件单独处理 | 可统一处理 |
| 工具函数 | 无 | `deptUtils` 提供树形操作 |
| 测试性 | 较难 | 容易单元测试 |

---

## 六、实施建议

### 6.1 迁移策略

1. **渐进式迁移**: 新功能使用 Service 方式，旧功能逐步替换
2. **保留兼容**: 现有的 `$API` 方式继续可用
3. **统一规范**: 团队约定后续开发使用 Service 方式

### 6.2 目录规范

```
src/api/services/
├── index.js          # 统一导出
├── deptService.js    # 部门服务
├── userService.js    # 用户服务
├── roleService.js    # 角色服务
└── commonService.js  # 通用服务
```

### 6.3 命名规范

- Service 文件: `{module}Service.js`
- API 对象: `{module}Api`
- 工具对象: `{module}Utils`
- 方法名: `getList`, `getById`, `create`, `update`, `delete`, `batchDelete`

---

## 七、完整示例代码

详见:
- `src/api/services/deptService.js` - 部门服务实现
- `src/api/services/index.js` - 统一导出
- `src/views/setting/dept/index.vue` - 列表页使用示例
- `src/views/setting/dept/save.vue` - 表单页使用示例
