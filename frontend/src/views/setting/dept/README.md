# 部门管理模块 - Vue3 工作流程文档

## 文件结构

```
dept/
├── index.vue          # 部门列表页面（主页面）
├── save.vue           # 部门新增/编辑/查看弹窗
├── index.vue.bak      # index.vue 的 Vue2 版本备份
├── save.vue.bak       # save.vue 的 Vue2 版本备份
└── README.md          # 本文档
```

---

## Vue3 核心概念速览

### 1. `<script setup>` 语法糖

Vue3 推荐使用的组合式 API 写法，特点：
- 不需要写 `export default`
- 定义的变量和方法自动暴露给模板使用
- 更好的 TypeScript 支持
- 代码组织更灵活

```vue
<script setup>
// 直接写代码，无需 export default
const count = ref(0)
const add = () => count.value++
</script>
```

### 2. 响应式数据

| API | 用途 | 示例 |
|-----|------|------|
| `ref` | 基本类型、对象、数组 | `const count = ref(0)` |
| `reactive` | 对象（仅） | `const form = reactive({name: ''})` |

**访问方式区别：**
```javascript
// ref 需要使用 .value
const count = ref(0)
console.log(count.value)  // 0

// reactive 直接访问属性
const form = reactive({name: '张三'})
console.log(form.name)    // 张三
```

### 3. 模板引用（获取组件/DOM实例）

```vue
<template>
  <!-- 通过 ref 属性绑定 -->
  <scTable ref="table"></scTable>
</template>

<script setup>
import { ref } from 'vue'

// 创建引用
const table = ref(null)

// 使用（在方法中）
const refresh = () => {
  table.value.refresh()  // 调用组件方法
}
</script>
```

### 4. 生命周期钩子

| Vue2 | Vue3 | 说明 |
|------|------|------|
| `beforeCreate` | - | setup 中直接写 |
| `created` | - | setup 中直接写 |
| `mounted` | `onMounted` | 组件挂载后 |
| `beforeUnmount` | `onBeforeUnmount` | 组件卸载前 |

```javascript
import { onMounted } from 'vue'

// 组件挂载后执行
onMounted(() => {
  console.log('组件已挂载')
  getData()  // 加载数据
})
```

---

## 部门管理模块工作流程

### 一、页面初始化流程

```
浏览器访问 /setting/dept
        ↓
[index.vue] 开始加载
        ↓
<script setup> 执行（按代码顺序）
  1. 导入 Vue API 和组件
  2. 获取 $API 对象
  3. 定义响应式数据
  4. 定义方法
        ↓
模板渲染（首次）
  - scTable 自动调用 apiObj 获取部门列表数据
  - 渲染表格
        ↓
页面显示完成
```

### 二、新增部门流程

```
用户点击"新增"按钮
        ↓
触发 add() 方法
        ↓
add() 方法执行：
  1. dialog.save = true
     （响应式数据变化，触发重新渲染）
        ↓
  2. nextTick() 等待 DOM 更新
     （确保弹窗组件已创建并挂载）
        ↓
  3. saveDialogRef.value.open()
     （调用弹窗组件的 open 方法）
        ↓
[save.vue] 弹窗组件响应
  1. open() 方法执行
  2. mode = 'add'（设置为新增模式）
  3. visible = true（显示弹窗）
        ↓
弹窗显示，用户填写表单
        ↓
用户点击"保存"按钮
        ↓
触发 submit() 方法
        ↓
submit() 方法执行：
  1. dialogForm.value.validate() 验证表单
  2. isSaveing = true（显示加载状态）
  3. 调用 $API.demo.post.post(form) 发送请求
  4. isSaveing = false（关闭加载状态）
  5. 判断返回结果
     - 成功：emit('success', form, mode) → 关闭弹窗
     - 失败：显示错误提示
        ↓
[index.vue] 接收 success 事件
  触发 handleSaveSuccess() 方法
        ↓
handleSaveSuccess() 执行：
  table.value.refresh() 刷新表格数据
        ↓
页面显示最新的部门列表
```

### 三、编辑部门流程

```
用户点击某行的"编辑"按钮
        ↓
触发 table_edit(row) 方法，传入当前行数据
        ↓
table_edit(row) 方法执行：
  1. dialog.save = true（创建弹窗组件）
  2. nextTick() 等待 DOM 更新
  3. saveDialogRef.value.open('edit').setData(row)
     （链式调用：先打开弹窗，再设置数据）
        ↓
[save.vue] 弹窗组件响应
  1. open('edit') 方法执行
     - mode = 'edit'
     - visible = true
     - 返回 { setData } 对象支持链式调用
  2. setData(row) 执行
     - 将 row 数据填充到 form 对象
        ↓
弹窗显示，表单已填充原数据
        ↓
用户修改表单，点击"保存"
        ↓
（后续流程与新增相同）
```

### 四、查看部门流程

```
用户点击某行的"查看"按钮
        ↓
触发 table_show(row) 方法
        ↓
table_show(row) 方法执行：
  与编辑类似，但传入 'show' 模式
        ↓
[save.vue] 弹窗组件响应
  1. open('show') 设置 mode = 'show'
  2. setData(row) 填充数据
  3. 模板中 :disabled="mode=='show'" 使表单只读
        ↓
弹窗显示，表单不可编辑，不显示"保存"按钮
```

### 五、删除部门流程

```
用户点击某行的"删除"按钮
        ↓
触发 el-popconfirm 确认弹窗
        ↓
用户点击"确定"确认删除
        ↓
触发 table_del(row) 方法
        ↓
table_del(row) 方法执行：
  1. 构造请求参数 { id: row.id }
  2. 调用 $API.demo.post.post(reqData) 发送删除请求
  3. 判断返回结果
     - 成功：
       * table.value.refresh() 刷新表格
       * ElMessage.success("删除成功") 显示成功消息
     - 失败：
       * ElMessageBox.alert() 显示错误弹窗
```

### 六、批量删除流程

```
用户勾选多行数据
        ↓
触发 selectionChange(sel) 方法
        ↓
selection.value = sel（保存选中项）
        ↓
批量删除按钮的 :disabled="selection.length==0" 变为可用
        ↓
用户点击"批量删除"按钮
        ↓
触发 batch_del() 方法
        ↓
batch_del() 方法执行：
  1. ElMessageBox.confirm() 显示确认弹窗
  2. 用户确认后：
     * ElLoading.service() 显示加载动画
     * table.value.refresh() 刷新表格
     * loading.close() 关闭加载动画
     * ElMessage.success("操作成功") 显示成功消息
```

---

## 关键代码解析

### 1. 为什么使用 nextTick？

```javascript
const add = () => {
  dialog.save = true      // 1. 设置状态，触发重新渲染
  nextTick(() => {        // 2. 等待 DOM 更新完成
    saveDialogRef.value.open()  // 3. 现在可以安全调用子组件方法
  })
}
```

**原因：** Vue 的 DOM 更新是异步的。当 `dialog.save = true` 后，弹窗组件不会立即创建，需要等待下一个"tick"。`nextTick` 确保在 DOM 更新完成后执行回调。

### 2. 链式调用的实现

```javascript
// save.vue 中的 open 方法
const open = (openMode = 'add') => {
  mode.value = openMode
  visible.value = true
  return {
    setData: setData    // 返回包含 setData 的对象
  }
}

// index.vue 中的使用
saveDialogRef.value.open('edit').setData(row)
// 等价于：
const result = saveDialogRef.value.open('edit')
result.setData(row)
```

### 3. 事件传递机制

```
[save.vue] 子组件
  emit('success', form, mode)  // 触发事件，携带数据
        ↓
[index.vue] 父组件模板
  @success="handleSaveSuccess"  // 监听事件
        ↓
[index.vue] 方法
  const handleSaveSuccess = (data, mode) => {
    // 接收事件和数据
  }
```

### 4. 表单验证流程

```javascript
const submit = () => {
  dialogForm.value.validate(async (valid) => {
    if (valid) {           // 验证通过
      // 执行保存
    } else {               // 验证失败
      // 不执行保存，表单显示错误提示
    }
  })
}
```

---

## Vue3 vs Vue2 对比

### index.vue 主要变化

| 功能 | Vue2 写法 | Vue3 写法 |
|------|----------|----------|
| 组件定义 | `export default { ... }` | `<script setup>` |
| 数据定义 | `data() { return {...} }` | `const data = ref/reactive(...)` |
| 方法定义 | `methods: { fn() {} }` | `const fn = () => {}` |
| 模板引用 | `this.$refs.table` | `const table = ref(null)` |
| 消息提示 | `this.$message` | `ElMessage`（导入） |
| 加载动画 | `this.$loading()` | `ElLoading.service()` |
| 获取API | `this.$API` | `getCurrentInstance().proxy.$API` |

### save.vue 主要变化

| 功能 | Vue2 写法 | Vue3 写法 |
|------|----------|----------|
| 事件定义 | `emits: ['success']` | `const emit = defineEmits(['success'])` |
| 暴露方法 | `this.$options.methods` | `defineExpose({ open, setData })` |
| 生命周期 | `mounted() {}` | `onMounted(() => {})` |

---

## 常见问题

### Q1: 为什么 `ref` 要使用 `.value`？

```javascript
const count = ref(0)
console.log(count)     // RefImpl 对象
console.log(count.value)  // 0

// 在模板中不需要 .value
// <span>{{ count }}</span>
```

`ref` 返回的是一个包装对象，需要通过 `.value` 访问/修改内部值。模板会自动解包，所以不需要 `.value`。

### Q2: `ref` 和 `reactive` 怎么选择？

```javascript
// 基本类型用 ref
const count = ref(0)
const name = ref('张三')

// 对象/数组两者都可以
const form = reactive({ name: '' })     // 推荐
const form = ref({ name: '' })          // 也可以

// 需要整体替换时用 ref
const list = ref([])
list.value = newList    // 整体替换

// reactive 不能直接替换
const list = reactive([])
list = newList          // 错误！会失去响应性
```

### Q3: 如何调试 Vue3 组件？

```javascript
// 在 <script setup> 中定义的数据和方法
// 可以在浏览器控制台通过以下方式访问：

// 1. 安装 Vue DevTools 扩展（推荐）

// 2. 临时添加全局访问（调试用）
const count = ref(0)
window.$count = count   // 然后在控制台输入 $count.value
```

---

## 相关链接

- [Vue3 官方文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vue3 组合式 API 指南](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
