import { useApiStore } from '@/store/apiStore';
//字典选择器配置

// 延迟获取 API Store 实例（避免在 Pinia 初始化前调用）
const getApiStore = () => useApiStore();

export default {
	// 使用 getter 延迟获取 API 对象
	get dicApiObj() {
		return getApiStore().api.system.dic.get;
	},
	parseData: function (res) {
		return {
			data: res.data,				//分析行数据字段结构
			msg: res.message,			//分析描述字段结构
			code: res.code				//分析状态字段结构
		}
	},
	request: {
		name: 'name'					//规定搜索字段
	},
	props: {
		label: 'label',					//映射label显示字段
		value: 'value',					//映射value值字段
	}
}
