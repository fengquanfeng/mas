<!--
  字典管理主页面
  功能：左侧显示字典分类树，右侧显示选中字典的明细项列表
  包含功能：字典增删改、字典项增删改、排序、状态切换
  
  数据流说明：
  1. 页面加载 -> 调用 getDic() 获取字典树（包含 children 字典项）
  2. dicRawList 保存原始数据（包含 children）
  3. dicList 用于树显示（过滤掉 children，不在树中显示字典项）
  4. 点击字典 -> 从 dicRawList 中获取 children -> 直接显示在右侧表格
  5. 不需要重新请求后端获取字典项
-->
<template>
  <!-- 页面主容器：左右布局 -->
  <el-container>
    <!-- 左侧边栏：字典分类树 -->
    <el-aside width="300px" v-loading="showDicloading">
      <el-container>
        <!-- 左侧头部：搜索过滤框 -->
        <el-header>
          <el-input placeholder="输入关键字进行过滤" v-model="dicFilterText" clearable></el-input>
        </el-header>
        <!-- 左侧主体：字典树 -->
        <el-main class="nopadding">
          <el-tree 
            ref="dic" 
            class="menu" 
            node-key="id" 
            :data="dicList" 
            :props="dicProps" 
            :highlight-current="true" 
            :expand-on-click-node="false" 
            :filter-node-method="dicFilterNode" 
            @node-click="dicClick"
          >
            <!-- 自定义节点内容 -->
            <template #default="{node, data}">
              <span class="custom-tree-node">
                <span class="label">{{ node.label }}</span>
                <span class="code">{{ data.code }}</span>
                <span class="do">
                  <el-button-group>
                    <el-button icon="el-icon-edit" size="small" @click.stop="dicEdit(data)"></el-button>
                    <el-button icon="el-icon-delete" size="small" @click.stop="dicDel(node, data)"></el-button>
                  </el-button-group>
                </span>
              </span>
            </template>
          </el-tree>
        </el-main>
        <!-- 左侧底部：添加字典按钮 -->
        <el-footer style="height:51px;">
          <el-button type="primary" size="small" icon="el-icon-plus" style="width: 100%;" @click="addDic">新增字典</el-button>
        </el-footer>
      </el-container>
    </el-aside>

    <!-- 右侧主内容区：字典项列表 -->
    <el-container class="is-vertical">
      <!-- 右侧头部：工具栏 -->
      <el-header>
        <div class="left-panel">
          <el-button type="primary" icon="el-icon-plus" @click="addInfo"></el-button>
          <el-button type="danger" plain icon="el-icon-delete" :disabled="selection.length==0" @click="batch_del"></el-button>
        </div>
      </el-header>
      <!-- 右侧主体：字典项表格 -->
      <el-main class="nopadding">
        <!-- 
          使用原生 el-table 替代 scTable
          因为数据已从 dicRawList 获取，不需要 API 请求
        -->
        <el-table 
          ref="tableRef" 
          :data="tableData" 
          row-key="id" 
          stripe
          @selection-change="selectionChange"
          table-layout="fixed"
          width="100%"
        >
          <!-- 多选列 -->
          <el-table-column type="selection" width="50"></el-table-column>
          <!-- 拖拽手柄列 -->
          <el-table-column label="" width="60">
            <template #default>
              <el-tag class="move" style="cursor: move;"><el-icon-d-caret style="width: 1em; height: 1em;"/></el-tag>
            </template>
          </el-table-column>
          <!-- 名称列：不设置宽度，自动填充 -->
          <el-table-column label="名称" prop="name" max-width="300"></el-table-column>
          <!-- 键值列：不设置宽度，自动填充 -->
          <el-table-column label="键值" prop="value" max-width="120"></el-table-column>
          <!-- 是否有效列：开关控制 -->
          <el-table-column label="是否有效" prop="status" width="100">
            <template #default="scope">
              <el-switch 
                v-model="scope.row.status" 
                @change="changeSwitch($event, scope.row)" 
                :loading="scope.row.$switch_status" 
                :active-value="1" 
                :inactive-value="0"
              ></el-switch>
            </template>
          </el-table-column>
          <!-- 操作列 -->
          <el-table-column label="操作" fixed="right" align="right" width="120">
            <template #default="scope">
              <el-button-group>
                <el-button text type="primary" size="small" @click="table_edit(scope.row, scope.$index)">编辑</el-button>
                <el-popconfirm title="确定删除吗？" @confirm="table_del(scope.row, scope.$index)">
                  <template #reference>
                    <el-button text type="primary" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </el-container>

  <!-- 字典分类弹窗组件 -->
  <DicDialog v-if="dialog.dic" ref="dicDialogRef" @success="handleDicSuccess" @closed="dialog.dic=false"></DicDialog>

  <!-- 字典项弹窗组件 -->
  <ListDialog v-if="dialog.list" ref="listDialogRef" @success="handleListSuccess" @closed="dialog.list=false"></ListDialog>

</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import DicDialog from './dic.vue'
import ListDialog from './list.vue'
import Sortable from 'sortablejs'

const { proxy } = getCurrentInstance()
const $API = proxy.$API

// ==================== 响应式数据定义 ====================

const dialog = reactive({
  dic: false,
  list: false
})

const showDicloading = ref(true)

// 原始字典数据（包含 children 字典项）
const dicRawList = ref([])

// 字典列表数据（用于树显示，过滤掉 children）
const dicList = ref([])

// 当前选中的字典
const currentDic = ref(null)

// 表格数据（字典项列表）
const tableData = ref([])

const dicFilterText = ref('')

const dicProps = {
  label: 'name'
}

const selection = ref([])

// ==================== 模板引用 ====================

const dic = ref(null)
const tableRef = ref(null)
const dicDialogRef = ref(null)
const listDialogRef = ref(null)

// ==================== 监听器 ====================

watch(dicFilterText, (val) => {
  dic.value.filter(val)
})

// ==================== 生命周期钩子 ====================

onMounted(() => {
  getDic()
  rowDrop()
})

// ==================== 方法定义 ====================

/**
 * 加载字典树数据
 * 流程：
 * 1. 调用后端 API 获取字典树（包含 children 字典项）
 * 2. dicRawList 保存原始数据
 * 3. dicList 过滤掉 children（字典项不在左侧树显示）
 * 4. 默认选中第一个字典，显示其字典项
 */
const getDic = async () => {
  try {
    const res = await $API.dicApi.tree.request()
    showDicloading.value = false
    
    // 保存原始数据（包含 children）
    dicRawList.value = res.data || []
    
    // 过滤掉 children，用于树显示
    dicList.value = dicRawList.value.map(item => ({
      id: item.id,
      code: item.code,
      name: item.name
    }))
    
    // 默认选中第一个字典
    const firstNode = dicList.value[0]
    if (firstNode) {
      nextTick(() => {
        dic.value.setCurrentKey(firstNode.id)
      })
      // 设置当前字典
      currentDic.value = firstNode
      // 从原始数据中获取 children，显示在表格
      loadTableData(firstNode.id)
    }
  } catch (error) {
    showDicloading.value = false
    ElMessage.error(error.message || '加载字典树失败')
  }
}

/**
 * 从 dicRawList 中加载字典项到表格
 * @param {string} dicId - 字典ID（字符串类型）
 */
const loadTableData = (dicId) => {
  const dict = dicRawList.value.find(item => item.id === dicId)
  if (dict && dict.children) {
    tableData.value = dict.children.map(item => ({
      id: item.id,
      name: item.name,
      value: item.value,
      status: item.status,
      orderNum: item.orderNum,
      dictionaryId: item.dictionaryId
    }))
  } else {
    tableData.value = []
  }
}

const dicFilterNode = (value, data) => {
  if (!value) return true
  const targetText = data.name + data.code
  return targetText.indexOf(value) !== -1
}

const addDic = () => {
  dialog.dic = true
  nextTick(() => {
    dicDialogRef.value.open()
  })
}

const dicEdit = (data) => {
  dialog.dic = true
  nextTick(() => {
    dicDialogRef.value.open('edit').setData(data)
  })
}

/**
 * 字典树点击事件
 * 从 dicRawList 中获取 children，直接显示在表格
 */
const dicClick = (data) => {
  currentDic.value = data
  loadTableData(data.id)
}

const dicDel = async (node, data) => {
  try {
    await ElMessageBox.confirm(`确定删除 ${data.name} 吗？`, '提示', {
      type: 'warning'
    })
    
    showDicloading.value = true
    
    await $API.dicApi.delete.request({ id: data.id })

    const dicCurrentKey = dic.value.getCurrentKey()
    dic.value.remove(data.id)
    
    // 同时从原始数据中移除
    const rawIndex = dicRawList.value.findIndex(item => item.id === data.id)
    if (rawIndex > -1) {
      dicRawList.value.splice(rawIndex, 1)
    }
    
    if (dicCurrentKey === data.id) {
      const firstNode = dicList.value.find(item => item.id !== data.id)
      if (firstNode) {
        dic.value.setCurrentKey(firstNode.id)
        currentDic.value = firstNode
        loadTableData(firstNode.id)
      } else {
        currentDic.value = null
        tableData.value = []
      }
    }

    ElMessage.success("删除成功")
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    showDicloading.value = false
  }
}

const rowDrop = () => {
  nextTick(() => {
    const tbody = tableRef.value?.$el?.querySelector('.el-table__body-wrapper tbody')
    if (!tbody) return
    
    Sortable.create(tbody, {
      handle: ".move",
      animation: 300,
      ghostClass: "ghost",
      async onEnd({ newIndex, oldIndex }) {
        const currRow = tableData.value.splice(oldIndex, 1)[0]
        tableData.value.splice(newIndex, 0, currRow)
        
        try {
          await $API.dicApi.itemSort.request({
            id: currRow.id,
            orderNum: newIndex
          })
          ElMessage.success("排序成功")
        } catch (error) {
          ElMessage.error(error.message || '排序失败')
          const revertRow = tableData.value.splice(newIndex, 1)[0]
          tableData.value.splice(oldIndex, 0, revertRow)
        }
      }
    })
  })
}

const addInfo = () => {
  if (!currentDic.value) {
    ElMessage.warning('请先选择字典')
    return
  }
  dialog.list = true
  nextTick(() => {
    listDialogRef.value.open().setData({ 
      dic: currentDic.value.id,
      dicName: currentDic.value.name  // 传递字典名称用于显示
    })
  })
}

const table_edit = (row) => {
  dialog.list = true
  nextTick(() => {
    listDialogRef.value.open('edit').setData({
      id: row.id,
      name: row.name,
      key: row.value,
      yx: String(row.status),
      dic: row.dictionaryId
    })
  })
}

const table_del = async (row, index) => {
  try {
    await $API.dicApi.itemDelete.request({ id: row.id })
    tableData.value.splice(index, 1)
    
    // 同时从原始数据的 children 中移除
    if (currentDic.value) {
      const dict = dicRawList.value.find(item => item.id === currentDic.value.id)
      if (dict && dict.children) {
        const childIndex = dict.children.findIndex(item => item.id === row.id)
        if (childIndex > -1) {
          dict.children.splice(childIndex, 1)
        }
      }
    }
    
    ElMessage.success("删除成功")
  } catch (error) {
    ElMessageBox.alert(error.message || '删除失败', "提示", { type: 'error' })
  }
}

const batch_del = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 项吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    const loading = ElLoading.service()
    try {
      // 批量删除
      for (const item of selection.value) {
        await $API.dicApi.itemDelete.request({ id: item.id })
      }
      
      // 从表格数据中移除
      selection.value.forEach(item => {
        const index = tableData.value.findIndex(t => t.id === item.id)
        if (index > -1) {
          tableData.value.splice(index, 1)
        }
      })
      
      // 从原始数据中移除
      if (currentDic.value) {
        const dict = dicRawList.value.find(item => item.id === currentDic.value.id)
        if (dict && dict.children) {
          selection.value.forEach(sel => {
            const childIndex = dict.children.findIndex(item => item.id === sel.id)
            if (childIndex > -1) {
              dict.children.splice(childIndex, 1)
            }
          })
        }
      }
      
      ElMessage.success("操作成功")
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    } finally {
      loading.close()
    }
  }).catch(() => {})
}

const selectionChange = (sel) => {
  selection.value = sel
}

const changeSwitch = async (val, row) => {
  row.$switch_status = true
  
  try {
    await $API.dicApi.itemStatus.request({
      id: row.id,
      status: val
    })
    row.status = val
    
    // 同步更新原始数据
    if (currentDic.value) {
      const dict = dicRawList.value.find(item => item.id === currentDic.value.id)
      if (dict && dict.children) {
        const child = dict.children.find(item => item.id === row.id)
        if (child) {
          child.status = val
        }
      }
    }
    
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '状态更新失败')
  } finally {
    delete row.$switch_status
  }
}

const handleDicSuccess = (data, mode) => {
  if (mode === 'add') {
    // 重新加载字典树，并选中新增的字典
    getDic().then(() => {
      // 根据后端返回的 id 找到新增的字典
      if (data.id) {
        const newDict = dicList.value.find(item => item.id === data.id)
        if (newDict) {
          // 选中新增的字典
          nextTick(() => {
            dic.value.setCurrentKey(newDict.id)
          })
          currentDic.value = newDict
          // 加载该字典的字典项
          loadTableData(newDict.id)
        }
      }
    })
  } else if (mode === 'edit') {
    // 更新节点数据
    const editNode = dic.value.getNode(data.id)
    if (editNode) {
      Object.assign(editNode.data, data)
    }
    // 更新原始数据
    const rawDict = dicRawList.value.find(item => item.id === data.id)
    if (rawDict) {
      rawDict.name = data.name
      rawDict.code = data.code
    }
  }
}

const handleListSuccess = (data, mode) => {
  if (mode === 'add') {
    // 添加到表格
    const newItem = {
      id: data.id,
      name: data.name,
      value: data.value,
      status: data.status,
      orderNum: data.orderNum || 0,
      dictionaryId: data.dictionaryId
    }
    tableData.value.push(newItem)
    
    // 同时添加到原始数据
    if (currentDic.value) {
      const dict = dicRawList.value.find(item => item.id === currentDic.value.id)
      if (dict) {
        if (!dict.children) {
          dict.children = []
        }
        dict.children.push(newItem)
      }
    }
  } else if (mode === 'edit') {
    // 更新表格数据（ID 已经是字符串类型，无需 parseInt）
    const row = tableData.value.find(item => item.id === data.id)
    if (row) {
      row.name = data.name
      row.value = data.value
      row.status = data.status
    }
    
    // 更新原始数据
    if (currentDic.value) {
      const dict = dicRawList.value.find(item => item.id === currentDic.value.id)
      if (dict && dict.children) {
        const child = dict.children.find(item => item.id === data.id)
        if (child) {
          child.name = data.name
          child.value = data.value
          child.status = data.status
        }
      }
    }
  }
}
</script>

<style scoped>
.menu:deep(.el-tree-node__label) {display: flex;flex: 1;height:100%;}
.custom-tree-node {display: flex;flex: 1;align-items: center;justify-content: space-between;font-size: 14px;padding-right: 24px;height:100%;}
.custom-tree-node .code {font-size: 12px;color: #999;}
.custom-tree-node .do {display: none;}
.custom-tree-node:hover .code {display: none;}
.custom-tree-node:hover .do {display: inline-block;}
</style>
