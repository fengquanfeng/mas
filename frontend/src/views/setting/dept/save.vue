<template>
	<!-- 
		Element Plus 的对话框组件
		:title="titleMap[mode]"：动态设置标题，根据 mode 从 titleMap 中获取对应文本
		v-model="visible"：双向绑定控制对话框显示/隐藏
		:width="500"：设置对话框宽度为 500px
		destroy-on-close：关闭时销毁对话框内容（释放内存）
		@closed="$emit('closed')"：关闭后触发 closed 事件，通知父组件
	-->
	<el-dialog :title="titleMap[mode]" v-model="visible" :width="500" destroy-on-close @closed="$emit('closed')">
		<!-- 
			Element Plus 的表单组件
			:model="form"：绑定表单数据对象
			:rules="rules"：绑定表单验证规则
			:disabled="mode=='show'"：查看模式下禁用表单（只读）
			ref="dialogForm"：获取表单实例，用于调用表单方法（如验证）
			label-width="100px"：设置标签宽度
		-->
		<el-form :model="form" :rules="rules" :disabled="mode=='show'" ref="dialogForm" label-width="100px">
			<!-- 上级部门选择项 -->
			<el-form-item label="上级部门" prop="parentId">
				<!-- 
					级联选择器组件
					v-model="form.parentId"：绑定选中的值
					:options="groups"：绑定选项数据（树形结构）
					:props="groupsProps"：绑定配置属性
					:show-all-levels="false"：不显示所有层级，只显示选中项
					clearable：支持清空选择
				-->
				<el-cascader v-model="form.parentId" :options="groups" :props="groupsProps" :show-all-levels="false" clearable style="width: 100%;"></el-cascader>
			</el-form-item>
			<!-- 部门名称输入项：必填 -->
			<el-form-item label="部门名称" prop="label">
				<el-input v-model="form.label" placeholder="请输入部门名称" clearable></el-input>
			</el-form-item>
			<!-- 排序输入项：数字输入框 -->
			<el-form-item label="排序" prop="sort">
				<!-- 
					数字输入框
					controls-position="right"：控制按钮在右侧
					:min="1"：最小值为 1
				-->
				<el-input-number v-model="form.sort" controls-position="right" :min="1" style="width: 100%;"></el-input-number>
			</el-form-item>
			<!-- 状态开关项 -->
			<el-form-item label="是否有效" prop="status">
				<!-- 
					开关组件
					:active-value="1"：开启时的值为 1
					:inactive-value="0"：关闭时的值为 0
				-->
				<el-switch v-model="form.status" :active-value="1" :inactive-value="0"></el-switch>
			</el-form-item>
			<!-- 备注输入项：多行文本 -->
			<el-form-item label="备注" prop="remark">
				<el-input v-model="form.remark" clearable type="textarea"></el-input>
			</el-form-item>
		</el-form>
		<!-- 对话框底部按钮区域 -->
		<template #footer>
			<!-- 取消按钮：点击关闭对话框 -->
			<el-button @click="visible=false" >取 消</el-button>
			<!-- 
				保存按钮
				v-if="mode!='show'"：查看模式下不显示保存按钮
				:loading="isSaveing"：保存时显示加载状态，防止重复提交
				@click="submit()"：点击触发提交方法
			-->
			<el-button v-if="mode!='show'" type="primary" :loading="isSaveing" @click="submit()">保 存</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
// 从 Vue 核心库导入需要的 API
// ref：创建响应式引用
// reactive：创建响应式对象
// onMounted：组件挂载后的生命周期钩子
// getCurrentInstance：获取当前组件实例
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
// 从 Element Plus 导入消息和弹窗组件
import { ElMessage, ElMessageBox } from 'element-plus'

// 获取当前组件实例，用于访问全局挂载的属性
const { proxy } = getCurrentInstance()
// 从实例中获取 API 对象
const $API = proxy.$API

// ==================== 事件定义区域 ====================

// defineEmits：定义组件可以触发的事件
// 'success'：保存成功时触发，携带保存的数据和模式
// 'closed'：对话框关闭时触发
const emit = defineEmits(['success', 'closed'])

// ==================== 数据定义区域 ====================

// 当前操作模式：'add' 新增 / 'edit' 编辑 / 'show' 查看
const mode = ref("add")

// 标题映射表：根据 mode 显示对应的标题
const titleMap = reactive({
	add: '新增',
	edit: '编辑',
	show: '查看'
})

// 控制对话框显示/隐藏
const visible = ref(false)

// 保存按钮的加载状态，防止重复提交
const isSaveing = ref(false)

// 表单数据对象，存储用户输入的内容
const form = reactive({
	id: "",           // 部门 ID（编辑时使用）
	parentId: "",    // 上级部门 ID
	label: "",       // 部门名称
	sort: 1,         // 排序序号
	status: "1",     // 状态：1-启用，0-停用
	remark: ""       // 备注
})

// 表单验证规则
const rules = reactive({
	sort: [
		{required: true, message: '请输入排序', trigger: 'change'}
	],
	label: [
		{required: true, message: '请输入部门名称'}
	]
})

// 上级部门下拉选项数据（树形结构）
const groups = ref([])

// 级联选择器的配置属性
const groupsProps = reactive({
	value: "id",           // 选中值的字段名
	emitPath: false,       // 只返回选中节点的值，不返回路径
	checkStrictly: true    // 可以选择任意一级（不仅限于叶子节点）
})

// ==================== 模板引用区域 ====================

// 表单组件的引用，用于调用表单的方法（如验证、重置）
const dialogForm = ref(null)

// ==================== 方法定义区域 ====================

/**
 * 打开对话框
 * @param {string} openMode - 打开模式：'add'/'edit'/'show'，默认为 'add'
 * @returns {Object} 返回包含 setData 方法的对象，支持链式调用
 * 
 * 使用示例：
 * // 新增
 * open()
 * 
 * // 编辑并设置数据
 * open('edit').setData(rowData)
 */
const open = (openMode = 'add') => {
	mode.value = openMode;
	visible.value = true;
	// 返回对象支持链式调用，如 open('edit').setData(row)
	return {
		setData: setData
	}
}

/**
 * 加载部门树数据
 * 从后端获取所有部门数据，用于上级部门下拉选择
 */
const getGroup = async () => {
	// 调用部门列表 API
	var res = await $API.system.dept.list.get();
	// 将返回的数据赋值给 groups，级联选择器会自动渲染树形结构
	groups.value = res.data;
}

/**
 * 表单提交方法
 * 工作流程：
 * 1. 验证表单数据是否符合规则
 * 2. 显示加载状态
 * 3. 调用保存 API
 * 4. 根据结果显示成功或失败提示
 * 5. 关闭对话框并通知父组件
 */
const submit = () => {
	// validate：表单验证方法，valid 为 true 表示验证通过
	dialogForm.value.validate(async (valid) => {
		if (valid) {
			// 开始保存，显示加载状态
			isSaveing.value = true;
			// 调用保存 API，传入表单数据
			var res = await $API.demo.post.post(form);
			// 保存完成，关闭加载状态
			isSaveing.value = false;
			// 判断返回结果
			if(res.code == 200){
				// 触发 success 事件，通知父组件保存成功
				// 携带表单数据和当前模式
				emit('success', form, mode.value)
				// 关闭对话框
				visible.value = false;
				// 显示成功消息
				ElMessage.success("操作成功")
			}else{
				// 显示错误弹窗
				ElMessageBox.alert(res.message, "提示", {type: 'error'})
			}
		}
	})
}

/**
 * 设置表单数据
 * @param {Object} data - 要填充的数据对象
 * 
 * 使用场景：
 * 编辑或查看时，将表格行的数据填充到表单中
 */
const setData = (data) => {
	// 逐个字段赋值
	form.id = data.id
	form.label = data.label
	form.status = data.status
	form.sort = data.sort
	form.parentId = data.parentId
	form.remark = data.remark

	// 也可以直接使用 Object.assign 合并对象
	// Object.assign(form, data)
}

// ==================== 暴露方法给父组件 ====================

/**
 * defineExpose：显式暴露方法给父组件
 * 父组件通过 ref 可以调用这些方法
 * 
 * 在 index.vue 中的使用方式：
 * saveDialogRef.value.open('edit')
 * saveDialogRef.value.setData(row)
 */
defineExpose({
	open,
	setData
})

// ==================== 生命周期钩子 ====================

/**
 * onMounted：组件挂载完成后执行
 * 此时 DOM 已经渲染完成，可以进行数据获取等操作
 */
onMounted(() => {
	// 组件挂载后立即加载部门树数据
	getGroup()
})
</script>

<style>
</style>
