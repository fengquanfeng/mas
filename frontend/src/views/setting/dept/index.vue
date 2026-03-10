<template>
	<!-- 页面容器：采用 Element Plus 的 Container 布局 -->
	<el-container>
		<!-- 页面顶部区域：放置操作按钮和搜索框 -->
		<el-header>
			<!-- 左侧按钮区域 -->
			<div class="left-panel">
				<!-- 新增按钮：点击触发 add 方法 -->
				<el-button type="primary" icon="el-icon-plus" @click="add"></el-button>
				<!-- 批量删除按钮：当没有选中项时禁用 -->
				<el-button type="danger" plain icon="el-icon-delete" :disabled="selection.length==0" @click="batch_del"></el-button>
			</div>
			<!-- 右侧搜索区域 -->
			<div class="right-panel">
				<div class="right-panel-search">
					<!-- 搜索输入框：双向绑定 search.keyword -->
					<el-input v-model="search.keyword" placeholder="部门名称" clearable></el-input>
					<!-- 搜索按钮 -->
					<el-button type="primary" icon="el-icon-search" @click="upsearch"></el-button>
				</div>
			</div>
		</el-header>
		<!-- 页面主体区域：放置数据表格 -->
		<el-main class="nopadding">
			<!-- 
				scTable 是项目封装的表格组件
				ref="table"：获取组件实例，用于调用组件方法
				:apiObj="apiObj"：传入 API 对象，表格会自动调用获取数据
				row-key="id"：指定行数据的唯一标识字段
				@selection-change="selectionChange"：监听多选变化事件
				hidePagination：隐藏分页（树形数据不需要分页）
			-->
			<scTable ref="table" :apiObj="apiObj" row-key="id" @selection-change="selectionChange" hidePagination>
				<!-- 多选列 -->
				<el-table-column type="selection" width="50"></el-table-column>
				<!-- 部门名称列 -->
				<el-table-column label="部门名称" prop="label" width="250"></el-table-column>
				<!-- 排序列 -->
				<el-table-column label="排序" prop="sort" width="150"></el-table-column>
				<!-- 状态列：使用自定义模板显示标签 -->
				<el-table-column label="状态" prop="status" width="150">
					<template #default="scope">
						<!-- scope.row 是当前行的数据 -->
						<el-tag v-if="scope.row.status==1" type="success">启用</el-tag>
						<el-tag v-if="scope.row.status==0" type="danger">停用</el-tag>
					</template>
				</el-table-column>
				<!-- 创建时间列 -->
				<el-table-column label="创建时间" prop="date" width="180"></el-table-column>
				<!-- 备注列：min-width 表示最小宽度，会自动撑满剩余空间 -->
				<el-table-column label="备注" prop="remark" min-width="300"></el-table-column>
				<!-- 操作列：固定在右侧 -->
				<el-table-column label="操作" fixed="right" align="right" width="170">
					<template #default="scope">
						<!-- 按钮组 -->
						<el-button-group>
							<!-- 查看按钮 -->
							<el-button text type="primary" size="small" @click="table_show(scope.row, scope.$index)">查看</el-button>
							<!-- 编辑按钮 -->
							<el-button text type="primary" size="small" @click="table_edit(scope.row, scope.$index)">编辑</el-button>
							<!-- 删除按钮：带确认弹窗 -->
							<el-popconfirm title="确定删除吗？" @confirm="table_del(scope.row, scope.$index)">
								<template #reference>
									<el-button text type="primary" size="small">删除</el-button>
								</template>
							</el-popconfirm>
						</el-button-group>
					</template>
				</el-table-column>

			</scTable>
		</el-main>
	</el-container>

	<!-- 
		弹窗组件：save.vue
		v-if="dialog.save"：控制组件的显示/销毁
		ref="saveDialogRef"：获取组件实例，用于调用组件内部方法
		@success="handleSaveSuccess"：监听保存成功事件
		@closed="dialog.save=false"：监听弹窗关闭事件，关闭时隐藏组件
	-->
	<SaveDialog v-if="dialog.save" ref="saveDialogRef" @success="handleSaveSuccess" @closed="dialog.save=false"></SaveDialog>

</template>

<!-- 
	<script setup> 是 Vue3 的组合式 API 语法糖
	特点：
	1. 不需要 export default，直接写代码即可
	2. 定义的变量和方法自动暴露给模板使用
	3. 更好的 TypeScript 支持
	4. 更简洁的代码组织方式
-->
<script setup>
// 从 Vue 核心库导入需要的 API
// ref：创建响应式引用（适用于基本类型、对象、数组）
// reactive：创建响应式对象（仅适用于对象）
// nextTick：DOM 更新后的回调
// getCurrentInstance：获取当前组件实例
import { ref, reactive, nextTick, getCurrentInstance } from 'vue'
// 从 Element Plus 导入消息和弹窗组件
// ElMessage：消息提示
// ElMessageBox：消息弹窗（确认框、警告框等）
// ElLoading：加载动画
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
// 导入弹窗组件（组件名大写避免与变量冲突）
import SaveDialog from './save.vue'

// 获取当前组件实例，用于访问全局挂载的属性（如 $API）
const { proxy } = getCurrentInstance()
// 从实例中获取 API 对象，用于调用后端接口
const $API = proxy.$API

// ==================== 数据定义区域 ====================

// reactive：创建响应式对象
// 用于控制弹窗的显示/隐藏
// 当 dialog.save 变为 true 时，弹窗组件会被创建并显示
const dialog = reactive({
	save: false
})

// ref：创建响应式引用
// apiObj 存储 API 配置对象，传递给 scTable 组件用于获取数据
const apiObj = ref($API.system.dept.list)

// selection 存储表格选中的行数据（多选）
const selection = ref([])

// search 存储搜索条件
const search = reactive({
	keyword: null
})

// ==================== 模板引用区域 ====================

// ref(null) 创建模板引用
// 在模板中通过 ref="table" 绑定后，可以通过 table.value 访问组件实例
// 用于调用 scTable 组件的方法（如 refresh 刷新数据）
const table = ref(null)

// 弹窗组件的引用，用于调用弹窗组件内部的方法（如 open、setData）
const saveDialogRef = ref(null)

// ==================== 方法定义区域 ====================

/**
 * 添加部门
 * 工作流程：
 * 1. 设置 dialog.save = true，触发弹窗组件创建
 * 2. nextTick 等待 DOM 更新完成（弹窗组件已挂载）
 * 3. 调用弹窗组件的 open() 方法，打开新增弹窗
 */
const add = () => {
	dialog.save = true
	nextTick(() => {
		// saveDialogRef.value 是弹窗组件实例
		// open() 是弹窗组件暴露的方法
		saveDialogRef.value.open()
	})
}

/**
 * 编辑部门
 * @param {Object} row - 当前行的数据
 * 工作流程：
 * 1. 设置 dialog.save = true，触发弹窗组件创建
 * 2. nextTick 等待 DOM 更新完成
 * 3. 调用弹窗组件的 open('edit') 方法，传入 'edit' 表示编辑模式
 * 4. 链式调用 setData(row) 将当前行数据传入弹窗
 */
const table_edit = (row) => {
	dialog.save = true
	nextTick(() => {
		// open('edit') 返回弹窗实例，支持链式调用
		saveDialogRef.value.open('edit').setData(row)
	})
}

/**
 * 查看部门详情
 * @param {Object} row - 当前行的数据
 * 工作流程与编辑类似，但传入 'show' 表示查看模式（表单只读）
 */
const table_show = (row) => {
	dialog.save = true
	nextTick(() => {
		saveDialogRef.value.open('show').setData(row)
	})
}

/**
 * 删除部门
 * @param {Object} row - 当前行的数据
 * 工作流程：
 * 1. 构造请求数据（只需要 id）
 * 2. 调用删除 API
 * 3. 根据返回结果显示成功或失败提示
 * 4. 刷新表格数据
 */
const table_del = async (row) => {
	// 构造请求参数
	var reqData = {id: row.id}
	// 调用 API，await 等待异步操作完成
	var res = await $API.demo.post.post(reqData);
	// 判断返回结果
	if(res.code == 200){
		// 刷新表格数据
		table.value.refresh()
		// 显示成功消息
		ElMessage.success("删除成功")
	}else{
		// 显示错误弹窗
		ElMessageBox.alert(res.message, "提示", {type: 'error'})
	}
}

/**
 * 批量删除
 * 工作流程：
 * 1. 显示确认弹窗，提示用户确认删除
 * 2. 用户确认后显示加载动画
 * 3. 刷新表格数据（实际项目中应该调用批量删除 API）
 * 4. 关闭加载动画，显示成功提示
 */
const batch_del = () => {
	// ElMessageBox.confirm 显示确认弹窗
	ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 项吗？如果删除项中含有子集将会被一并删除`, '提示', {
		type: 'warning'
	}).then(() => {
		// 显示加载动画
		const loading = ElLoading.service();
		// 刷新表格
		table.value.refresh()
		// 关闭加载动画
		loading.close();
		// 显示成功消息
		ElMessage.success("操作成功")
	}).catch(() => {
		// 用户取消删除，不做任何操作
	})
}

/**
 * 表格多选变化回调
 * @param {Array} sel - 选中的行数据数组
 * 当用户勾选/取消勾选表格行时触发，更新 selection 数据
 */
const selectionChange = (sel) => {
	selection.value = sel;
}

/**
 * 搜索方法
 * 实际项目中应该根据 search.keyword 调用 API 获取筛选后的数据
 */
const upsearch = () => {
	// 预留搜索逻辑
}

/**
 * 根据 ID 在树形数据中查找节点
 * @param {string|number} id - 要查找的节点 ID
 * @returns {Object|null} 找到的节点数据或 null
 * 这是一个递归查找方法，用于在树形结构中找到指定 ID 的节点
 */
const filterTree = (id) => {
	var target = null;
	// 递归查找函数
	function filter(tree){
		tree.forEach(item => {
			// 找到匹配的节点
			if(item.id == id){
				target = item
			}
			// 如果有子节点，递归查找
			if(item.children){
				filter(item.children)
			}
		})
	}
	// 从表格数据开始查找
	filter(table.value.tableData)
	return target
}

/**
 * 保存成功后的回调
 * @param {Object} data - 保存的数据
 * @param {string} mode - 操作模式（add/edit）
 * 无论新增还是编辑，都刷新表格数据以显示最新状态
 */
const handleSaveSuccess = (data, mode) => {
	if(mode=='add'){
		table.value.refresh()
	}else if(mode=='edit'){
		table.value.refresh()
	}
}
</script>

<style>
</style>
