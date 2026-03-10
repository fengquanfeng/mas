# Vue2 到 Vue3 迁移计划 - views/setting/dept

## 目标

将 `views/setting/dept` 目录下的 Vue2 组件迁移到 Vue3 Composition API 风格。

## 文件清单

1. `index.vue` - 部门列表页面
2. `save.vue` - 部门新增/编辑/查看弹窗

## 迁移步骤

### 1. index.vue 迁移

#### 1.1 引入部分

* 添加 `ref`, `reactive`, `onMounted`, `nextTick` 等 Vue3 组合式 API 导入

* 保持 `saveDialog` 组件导入

#### 1.2 数据定义转换

| Vue2 (data)                          | Vue3 (ref/reactive)                          |
| ------------------------------------ | -------------------------------------------- |
| `dialog: { save: false }`            | `const dialog = reactive({ save: false })`   |
| `apiObj: this.$API.system.dept.list` | `const apiObj = ref($API.system.dept.list)`  |
| `selection: []`                      | `const selection = ref([])`                  |
| `search: { keyword: null }`          | `const search = reactive({ keyword: null })` |

#### 1.3 方法转换

* 所有方法改为普通函数

* `this.$refs` → 使用模板 ref

* `this.$nextTick` → `nextTick`

* `this.$message` → `ElMessage`

* `this.$confirm` → `ElMessageBox.confirm`

* `this.$alert` → `ElMessageBox.alert`

#### 1.4 模板引用

```javascript
const table = ref(null)
const saveDialog = ref(null)
```

#### 1.5 生命周期

* `mounted` → `onMounted`

* 其他生命周期相应转换

### 2. save.vue 迁移

#### 2.1 引入部分

* 添加 Vue3 组合式 API 导入

#### 2.2 数据定义转换

| Vue2 (data)          | Vue3 (ref/reactive)                   |
| -------------------- | ------------------------------------- |
| `mode: "add"`        | `const mode = ref('add')`             |
| `titleMap`           | `const titleMap = reactive({...})`    |
| `visible: false`     | `const visible = ref(false)`          |
| `isSaveing: false`   | `const isSaveing = ref(false)`        |
| `form: {...}`        | `const form = reactive({...})`        |
| `rules: {...}`       | `const rules = reactive({...})`       |
| `groups: []`         | `const groups = ref([])`              |
| `groupsProps: {...}` | `const groupsProps = reactive({...})` |

#### 2.3 方法转换

* `open()` 方法返回对象改为直接操作

* `submit()` 中使用 `dialogForm.value.validate()`

* 使用 `defineEmits` 定义事件

#### 2.4 模板引用

```javascript
const dialogForm = ref(null)
```

#### 2.5 生命周期

* `mounted` → `onMounted`

## 关键变更点

### index.vue

1. 使用 `<script setup>` 语法
2. 使用 `const table = ref(null)` 替代 `this.$refs.table`
3. 使用 `const saveDialog = ref(null)` 替代 `this.$refs.saveDialog`
4. 方法中访问数据不再需要 `this`

### save.vue

1. 使用 `<script setup>` 语法
2. 使用 `defineEmits(['success', 'closed'])` 定义事件
3. 使用 `const dialogForm = ref(null)` 替代 `this.$refs.dialogForm`
4. `open()` 方法不再返回 `this`，直接操作状态

## 验证清单

* [ ] 列表页面正常加载

* [ ] 新增按钮正常弹出对话框

* [ ] 编辑功能正常

* [ ] 查看功能正常

* [ ] 删除功能正常

* [ ] 批量删除功能正常

* [ ] 搜索功能正常

* [ ] 表单验证正常

* [ ] 保存成功回调正常

