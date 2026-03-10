<!--
  字典分类弹窗组件
  功能：新增/编辑字典分类
  说明：
    - code 由用户手动输入
    - 不做树形结构，所有字典平级
    - 前端校验字典名称和编码是否已存在
    - ID 为字符串类型（后端生成）
-->
<template>
  <el-dialog :title="titleMap[mode]" v-model="visible" :width="330" destroy-on-close @closed="$emit('closed')">
    <el-form :model="form" :rules="rules" ref="dialogForm" label-width="80px" label-position="left">
      <!-- 字典名称：必填，需要校验是否已存在 -->
      <el-form-item label="字典名称" prop="name">
        <el-input v-model="form.name" clearable placeholder="请输入字典名称"></el-input>
      </el-form-item>
      <!-- 编码：必填，手动维护，需要校验是否已存在 -->
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" clearable placeholder="请输入编码"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" :loading="isSaveing" @click="submit()">保 存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const { proxy } = getCurrentInstance()
const $API = proxy.$API

const emit = defineEmits(['success', 'closed'])

const mode = ref('add')
const titleMap = {
  add: '新增字典',
  edit: '编辑字典'
}

const visible = ref(false)
const isSaveing = ref(false)
const dialogForm = ref(null)

// 表单数据（ID 为字符串类型，code 手动输入）
const form = reactive({
  id: '',      // 字典ID（字符串，后端生成）
  name: '',    // 字典名称（必填）
  code: ''     // 字典编码（必填，手动维护）
})

// 字典列表（用于校验名称和编码是否已存在）
const dicList = ref([])

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const exist = dicList.value.find(item => {
          if (mode.value === 'edit' && item.id === form.id) {
            return false
          }
          return item.name === value
        })
        if (exist) {
          callback(new Error('字典名称已存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入编码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const exist = dicList.value.find(item => {
          if (mode.value === 'edit' && item.id === form.id) {
            return false
          }
          return item.code === value
        })
        if (exist) {
          callback(new Error('编码已存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

/**
 * 打开弹窗
 */
const open = (openMode = 'add') => {
  mode.value = openMode
  visible.value = true
  loadDicList()
  return { setData }
}

/**
 * 加载字典列表
 */
const loadDicList = async () => {
  try {
    const res = await $API.dicApi.tree.request()
    dicList.value = res.data || []
  } catch (error) {
    console.error('加载字典列表失败:', error)
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
      const submitData = {
        name: form.name,
        code: form.code
      }
      
      const api = mode.value === 'add' ? $API.dicApi.create : $API.dicApi.update
      const params = mode.value === 'add' 
        ? submitData 
        : { ...submitData, id: form.id }
      
      const res = await api.request(params)

      if (res.code === 200) {
        const resultData = {
          id: res.data?.id || form.id,
          name: form.name,
          code: form.code
        }
        emit('success', resultData, mode.value)
        visible.value = false
        ElMessage.success('操作成功')
      } else {
        ElMessageBox.alert(res.message, '提示', { type: 'error' })
      }
    } catch (error) {
      ElMessageBox.alert(error.message || '操作失败', '提示', { type: 'error' })
    } finally {
      isSaveing.value = false
    }
  })
}

/**
 * 设置表单数据
 */
const setData = (data) => {
  form.id = data.id || ''
  form.name = data.name || ''
  form.code = data.code || ''
}

defineExpose({ 
  open,
  setData
})
</script>
