# 部门管理后端接口对接方案

## 一、当前状态分析

### 1.1 现有 API 配置
```javascript
// src/api/model/system.js
dept: {
    list: {
        url: `${config.API_URL}/system/dept/list`,
        name: "获取部门列表",
        get: async function(params){
            return await http.get(this.url, params);
        }
    }
}
```

### 1.2 当前页面使用情况
- **index.vue**: 使用 `$API.system.dept.list` 获取部门列表
- **save.vue**: 使用 `$API.system.dept.list.get()` 获取部门树
- **问题**: 只有查询接口，缺少增删改接口

---

## 二、推荐方案

### 方案 A：扩展 system.js（推荐，符合现有规范）

在 `src/api/model/system.js` 中扩展 dept 模块：

```javascript
dept: {
    // 获取部门列表（树形）
    list: {
        url: `${config.API_URL}/system/dept/list`,
        name: "获取部门列表",
        get: async function(params){
            return await http.get(this.url, params);
        }
    },
    // 新增部门
    add: {
        url: `${config.API_URL}/system/dept/add`,
        name: "新增部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    },
    // 编辑部门
    edit: {
        url: `${config.API_URL}/system/dept/edit`,
        name: "编辑部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    },
    // 删除部门
    del: {
        url: `${config.API_URL}/system/dept/delete`,
        name: "删除部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    }
}
```

**优点**:
- 符合项目现有 API 组织规范
- 其他模块（user、role）也在使用 system.dept.list
- 统一维护，便于管理

**缺点**:
- system.js 文件会越来越庞大

---

### 方案 B：创建独立的 dept.js

创建 `src/api/model/dept.js`：

```javascript
import config from "@/config"
import http from "@/utils/request"

export default {
    // 获取部门列表
    list: {
        url: `${config.API_URL}/system/dept/list`,
        name: "获取部门列表",
        get: async function(params){
            return await http.get(this.url, params);
        }
    },
    // 新增部门
    add: {
        url: `${config.API_URL}/system/dept/add`,
        name: "新增部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    },
    // 编辑部门
    edit: {
        url: `${config.API_URL}/system/dept/edit`,
        name: "编辑部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    },
    // 删除部门
    del: {
        url: `${config.API_URL}/system/dept/delete`,
        name: "删除部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    }
}
```

**优点**:
- 模块独立，便于维护
- 部门相关接口集中管理

**缺点**:
- 需要修改现有代码中的 `$API.system.dept` 为 `$API.dept`
- 其他使用部门列表的模块也需要修改

---

## 三、现代化 API 管理方案（推荐新项目采用）

### 方案 C：使用 TypeScript + Axios 封装（推荐新项目）

```typescript
// src/api/services/deptService.ts
import request from '@/utils/request'
import type { Dept, DeptQuery, ApiResponse } from '@/types'

export const deptApi = {
  // 获取部门列表
  getList: (params?: DeptQuery) => 
    request.get<ApiResponse<Dept[]>>('/system/dept/list', { params }),
  
  // 新增部门
  create: (data: Omit<Dept, 'id'>) => 
    request.post<ApiResponse<Dept>>('/system/dept', data),
  
  // 编辑部门
  update: (id: string, data: Partial<Dept>) => 
    request.put<ApiResponse<Dept>>(`/system/dept/${id}`, data),
  
  // 删除部门
  delete: (id: string) => 
    request.delete<ApiResponse<void>>(`/system/dept/${id}`),
  
  // 批量删除
  batchDelete: (ids: string[]) => 
    request.post<ApiResponse<void>>('/system/dept/batch', { ids }),
}
```

**优点**:
- TypeScript 类型安全，IDE 智能提示
- 代码简洁，现代化
- 易于单元测试
- 支持泛型，响应类型明确

**缺点**:
- 需要引入 TypeScript
- 需要定义类型文件

---

### 方案 D：使用 TanStack Query (React Query) / Vue Query

```typescript
// src/composables/useDeptApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { deptApi } from '@/api/services/deptService'

// 获取部门列表
export const useDeptList = (params?: Ref<DeptQuery>) => {
  return useQuery({
    queryKey: ['dept', 'list', params],
    queryFn: () => deptApi.getList(params?.value),
  })
}

// 新增部门
export const useCreateDept = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deptApi.create,
    onSuccess: () => {
      // 自动刷新列表缓存
      queryClient.invalidateQueries({ queryKey: ['dept', 'list'] })
    },
  })
}

// 编辑部门
export const useUpdateDept = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dept> }) => 
      deptApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dept', 'list'] })
    },
  })
}
```

**优点**:
- 自动缓存管理
- 自动重试、轮询、实时更新
- 加载状态、错误处理内置
- 乐观更新支持
- 开发体验极佳

**缺点**:
- 需要学习新库
- 增加包体积
- 需要重构现有代码

---

### 方案 E：使用 OpenAPI / Swagger 自动生成

```javascript
// 使用 openapi-generator 或 orval 自动生成
// src/api/generated/deptApi.js

/**
 * 此文件由 openapi-generator 自动生成
 * 请勿手动修改
 */

import request from '@/utils/request'

export const DeptApi = {
  /**
   * 获取部门列表
   * @param {Object} params - 查询参数
   * @returns {Promise<DeptListResponse>}
   */
  getDeptList: (params) => 
    request.get('/system/dept/list', { params }),
  
  /**
   * 创建部门
   * @param {CreateDeptRequest} data
   * @returns {Promise<DeptResponse>}
   */
  createDept: (data) => 
    request.post('/system/dept', data),
  
  // ... 其他方法
}
```

**优点**:
- 前后端接口定义一致
- 自动生成类型定义
- 减少手写代码错误
- API 文档即代码

**缺点**:
- 需要维护 Swagger/OpenAPI 文档
- 需要配置生成工具
- 生成代码可能需要调整

---

### 方案 F：使用 tRPC 或 GraphQL

#### tRPC 方案（全栈 TypeScript）

```typescript
// server/routers/dept.ts
import { router, procedure } from '../trpc'
import { z } from 'zod'

export const deptRouter = router({
  list: procedure
    .input(z.object({ keyword: z.string().optional() }))
    .query(async ({ input }) => {
      return await db.dept.findMany({ where: input })
    }),
  
  create: procedure
    .input(DeptSchema)
    .mutation(async ({ input }) => {
      return await db.dept.create({ data: input })
    }),
})

// client 直接调用，完全类型安全
const { data } = await trpc.dept.list.query({ keyword: '技术' })
```

**优点**:
- 端到端类型安全
- 无需手动维护 API 层
- 自动类型推断
- 极致开发体验

**缺点**:
- 前后端必须都是 TypeScript
- 需要学习 tRPC
- 与现有后端不兼容

---

## 四、后端接口规范建议

### 4.1 RESTful 风格（推荐）

| 操作 | 方法 | URL | 说明 |
|------|------|-----|------|
| 查询列表 | GET | `/api/system/dept/list` | 获取部门树形列表 |
| 新增 | POST | `/api/system/dept` | 新增部门 |
| 编辑 | PUT | `/api/system/dept/{id}` | 编辑部门 |
| 删除 | DELETE | `/api/system/dept/{id}` | 删除部门 |
| 批量删除 | DELETE | `/api/system/dept` | 批量删除（body传ids）|

### 4.2 传统风格（与现有代码一致）

| 操作 | 方法 | URL | 说明 |
|------|------|-----|------|
| 查询列表 | GET | `/api/system/dept/list` | 获取部门树形列表 |
| 新增 | POST | `/api/system/dept/add` | 新增部门 |
| 编辑 | POST | `/api/system/dept/edit` | 编辑部门 |
| 删除 | POST | `/api/system/dept/delete` | 删除部门 |
| 批量删除 | POST | `/api/system/dept/batchDelete` | 批量删除 |

---

## 五、前端代码修改计划

### 5.1 API 层修改（选择方案 A）

修改 `src/api/model/system.js`，在 dept 下添加：

```javascript
dept: {
    list: {
        url: `${config.API_URL}/system/dept/list`,
        name: "获取部门列表",
        get: async function(params){
            return await http.get(this.url, params);
        }
    },
    add: {
        url: `${config.API_URL}/system/dept/add`,
        name: "新增部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    },
    edit: {
        url: `${config.API_URL}/system/dept/edit`,
        name: "编辑部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    },
    del: {
        url: `${config.API_URL}/system/dept/delete`,
        name: "删除部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    },
    batchDel: {
        url: `${config.API_URL}/system/dept/batchDelete`,
        name: "批量删除部门",
        post: async function(data){
            return await http.post(this.url, data);
        }
    }
}
```

### 5.2 index.vue 修改

#### 删除方法修改
```javascript
// 原代码（使用 demo.post）
const table_del = async (row) => {
    var reqData = {id: row.id}
    var res = await $API.demo.post.post(reqData);
    // ...
}

// 修改为
const table_del = async (row) => {
    var reqData = {id: row.id}
    var res = await $API.system.dept.del.post(reqData);
    if(res.code == 200){
        table.value.refresh()
        ElMessage.success("删除成功")
    }else{
        ElMessageBox.alert(res.message, "提示", {type: 'error'})
    }
}
```

#### 批量删除方法修改
```javascript
// 原代码（只刷新表格）
const batch_del = () => {
    ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 项吗？`, '提示', {
        type: 'warning'
    }).then(() => {
        const loading = ElLoading.service();
        // 这里应该调用批量删除 API
        $API.system.dept.batchDel.post({ids: selection.value.map(item => item.id)})
            .then(res => {
                loading.close();
                if(res.code == 200){
                    table.value.refresh()
                    ElMessage.success("操作成功")
                }else{
                    ElMessageBox.alert(res.message, "提示", {type: 'error'})
                }
            })
    }).catch(() => {})
}
```

### 5.3 save.vue 修改

#### 提交方法修改
```javascript
// 原代码（使用 demo.post）
const submit = () => {
    dialogForm.value.validate(async (valid) => {
        if (valid) {
            isSaveing.value = true;
            var res = await $API.demo.post.post(form);
            // ...
        }
    })
}

// 修改为
const submit = () => {
    dialogForm.value.validate(async (valid) => {
        if (valid) {
            isSaveing.value = true;
            // 根据 mode 选择调用新增或编辑接口
            const api = mode.value === 'add' ? $API.system.dept.add : $API.system.dept.edit;
            var res = await api.post(form);
            isSaveing.value = false;
            if(res.code == 200){
                emit('success', form, mode.value)
                visible.value = false;
                ElMessage.success("操作成功")
            }else{
                ElMessageBox.alert(res.message, "提示", {type: 'error'})
            }
        }
    })
}
```

---

## 六、后端接口数据格式

### 6.1 请求格式

#### 新增/编辑部门
```json
{
    "id": "123",           // 编辑时必填，新增时为空
    "parentId": "0",       // 上级部门ID，顶级为 "0"
    "label": "技术部",      // 部门名称
    "sort": 1,             // 排序
    "status": 1,           // 状态：1-启用，0-停用
    "remark": "备注信息"    // 备注
}
```

#### 删除部门
```json
{
    "id": "123"            // 部门ID
}
```

#### 批量删除
```json
{
    "ids": ["123", "456", "789"]   // 部门ID数组
}
```

### 6.2 响应格式

#### 成功响应
```json
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "id": "123",
        "label": "技术部",
        // ... 其他字段
    }
}
```

#### 失败响应
```json
{
    "code": 500,
    "message": "部门名称已存在",
    "data": null
}
```

#### 列表查询响应（树形结构）
```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": "1",
            "parentId": "0",
            "label": "总公司",
            "sort": 1,
            "status": 1,
            "remark": "",
            "date": "2024-01-01 12:00:00",
            "children": [
                {
                    "id": "11",
                    "parentId": "1",
                    "label": "技术部",
                    "sort": 1,
                    "status": 1,
                    "remark": "",
                    "date": "2024-01-01 12:00:00"
                }
            ]
        }
    ]
}
```

---

## 七、方案对比总结

| 方案 | 适用场景 | 学习成本 | 开发效率 | 维护成本 | 推荐度 |
|------|---------|---------|---------|---------|--------|
| A. 扩展 system.js | 现有项目快速迭代 | 低 | 高 | 中 | ⭐⭐⭐⭐ |
| B. 独立 dept.js | 中小型项目 | 低 | 高 | 低 | ⭐⭐⭐ |
| C. TS + Axios | 新项目，追求类型安全 | 中 | 高 | 低 | ⭐⭐⭐⭐⭐ |
| D. TanStack Query | 复杂数据交互场景 | 中 | 极高 | 低 | ⭐⭐⭐⭐⭐ |
| E. OpenAPI 生成 | 大型团队，规范严格 | 中 | 极高 | 极低 | ⭐⭐⭐⭐⭐ |
| F. tRPC/GraphQL | 全栈 TS，追求极致体验 | 高 | 极高 | 低 | ⭐⭐⭐⭐ |

---

## 八、实施步骤

### 步骤 1：确认后端接口（需要后端配合）
- [ ] 确认后端提供的接口 URL 和请求方式
- [ ] 确认请求参数和响应格式
- [ ] 确认是否需要权限控制

### 步骤 2：修改 API 配置
- [ ] 修改 `src/api/model/system.js` 添加 dept 相关接口

### 步骤 3：修改前端页面
- [ ] 修改 `index.vue` 中的删除和批量删除方法
- [ ] 修改 `save.vue` 中的提交方法

### 步骤 4：测试验证
- [ ] 测试新增部门
- [ ] 测试编辑部门
- [ ] 测试删除部门
- [ ] 测试批量删除部门
- [ ] 测试表单验证
- [ ] 测试错误处理

---

## 九、注意事项

1. **接口权限**：确保后端接口有相应的权限控制
2. **数据校验**：前端和后端都要做数据校验
3. **错误处理**：统一错误处理，给用户友好的提示
4. **加载状态**：保存和删除时显示加载状态，防止重复提交
5. **刷新机制**：操作成功后及时刷新列表数据

---

## 十、相关文件

- `src/api/model/system.js` - API 配置文件
- `src/views/setting/dept/index.vue` - 部门列表页面
- `src/views/setting/dept/save.vue` - 部门编辑弹窗
- `src/utils/request.js` - HTTP 请求封装
