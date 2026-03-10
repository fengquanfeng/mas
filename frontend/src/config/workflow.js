import { useApiStore } from '@/store/apiStore';
//审批工作流人员/组织选择器配置

// 延迟获取 API Store 实例（避免在 Pinia 初始化前调用）
const getApiStore = () => useApiStore();

export default {
	//配置接口正常返回代码
	successCode: 200,
	//配置组织
	group: {
		//请求接口对象
		get apiObj() {
			return getApiStore().api.system.dept.list;
		},
		//接受数据字段映射
		parseData: function (res) {
			return {
				rows: res.data,
				msg: res.message,
				code: res.code
			}
		},
		//显示数据字段映射
		props: {
			key: 'id',
			label: 'label',
			children: 'children'
		}
	},
	//配置用户
	user: {
		get apiObj() {
			return getApiStore().api.demo.page;
		},
		pageSize: 20,
		parseData: function (res) {
			return {
				rows: res.data.rows,
				total: res.data.total,
				msg: res.message,
				code: res.code
			}
		},
		props: {
			key: 'id',
			label: 'user',
		},
		request: {
			page: 'page',
			pageSize: 'pageSize',
			groupId: 'groupId',
			keyword: 'keyword'
		}
	},
	//配置角色
	role: {
		//请求接口对象
		get apiObj() {
			return getApiStore().api.system.dept.list;
		},
		//接受数据字段映射
		parseData: function (res) {
			return {
				rows: res.data,
				msg: res.message,
				code: res.code
			}
		},
		//显示数据字段映射
		props: {
			key: 'id',
			label: 'label',
			children: 'children'
		}
	}
}
