<!--
  字典项弹窗组件
  功能：新增/编辑字典项
  说明：
    - ID 为字符串类型（后端生成，如 "1001", "1002"）
    - dictionaryId 保留为数字（用于后端关联查询）
-->
<template>
  <el-dialog :title="titleMap[mode]" v-model="visible" :width="400" destroy-on-close @closed="$emit('closed')">
    <el-form :model="form" :rules="rules" ref="dialogForm" label-width="100px" label-position="left">
      <!-- 所属字典：只读显示 -->
      <el-form-item label="所属字典">
        <el-input v-model="form.dicName" disabled></el-input>
      </el-form-item>
      <!-- 项名称 -->
      <el-form-item label="项名称" prop="name">
        <el-input v-model="form.name" clearable placeholder="请输入项名称"></el-input>
      </el-form-item>
      <!-- 键值 -->
      <el-form-item label="键值" prop="key">
        <el-input v-model="form.key" clearable placeholder="请输入键值"></el-input>
      </el-form-item>
      <!-- 是否有效 -->
      <el-form-item label="是否有效" prop="yx">
        <el-switch v-model="form.yx" active-value="1" inactive-value="0"></el-switch>
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
  add: '新增项',
  edit: '编辑项'
}

const visible = ref(false)
const isSaveing = ref(false)
const dialogForm = ref(null)

// 表单数据（ID 为字符串类型，dictionaryId 为数字类型）
const form = reactive({
  id: '',        // 字典项ID（字符串，如 "1001"）
  dic: '',       // 所属字典ID（字符串，如 "1"）
  dicName: '',   // 所属字典名称（显示用）
  name: '',      // 项名称
  key: '',       // 键值
  yx: '1'        // 是否有效（字符串 "1" 或 "0"）
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入项名称' }
  ],
  key: [
    { required: true, message: '请输入键值' }
  ]
}

/**
 * 打开弹窗
 */
const open = (openMode = 'add') => {
  mode.value = openMode
  
  // 新增模式时重置表单
  if (openMode === 'add') {
    form.id = ''
    form.name = ''
    form.key = ''
    form.yx = '1'
    form.dic = ''
    form.dicName = ''
  }
  
  visible.value = true
  return { setData }
}

/**
 * 表单提交
 */
const submit = () => {
  dialogForm.value.validate(async (valid) => {
    if (!valid) return

    isSaveing.value = true
    
    try {
      // 提交数据
      // dictionaryId 直接使用字符串（后端现在接受字符串）
      // id 在新增时不需要传（后端生成）
      const submitData = {
        dictionaryId: form.dic,  // 字符串类型
        name: form.name,
        value: form.key,
        status: Number(form.yx),
        orderNum: 0
      }
      
      const api = mode.value === 'add' ? $API.dicApi.itemCreate : $API.dicApi.itemUpdate
      
      // 编辑模式需要传 id
      const params = mode.value === 'add' 
        ? submitData 
        : { ...submitData, id: form.id }
      
      const res = await api.request(params)

      if (res.code === 200) {
        const resultData = {
          id: res.data?.id,           // 字符串，如 "1001"
          dictionaryId: submitData.dictionaryId,  // 数字，如 1
          name: submitData.name,
          value: submitData.value,
          status: submitData.status,
          orderNum: submitData.orderNum
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
  form.key = data.key || data.value || ''
  form.yx = data.yx !== undefined ? String(data.yx) : (data.status !== undefined ? String(data.status) : '1')
  form.dic = data.dic || data.dictionaryId || ''
  form.dicName = data.dicName || data.dicCode || ''
}

defineExpose({ 
  open,
  setData
})
</script>
