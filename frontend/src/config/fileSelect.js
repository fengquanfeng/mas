import { useApiStore } from '@/store/apiStore';
//文件选择器配置

// 延迟获取 API Store 实例（避免在 Pinia 初始化前调用）
const getApiStore = () => useApiStore();

export default {
	// 使用 getter 延迟获取 API 对象
	get apiObj() {
		return getApiStore().api.common.upload;
	},
	get menuApiObj() {
		return getApiStore().api.common.file.menu;
	},
	get listApiObj() {
		return getApiStore().api.common.file.list;
	},
	successCode: 200,
	maxSize: 30,
	max: 99,
	uploadParseData: function (res) {
		return {
			id: res.data.id,
			fileName: res.data.fileName,
			url: res.data.src
		}
	},
	listParseData: function (res) {
		return {
			rows: res.data.rows,
			total: res.data.total,
			msg: res.message,
			code: res.code
		}
	},
	request: {
		page: 'page',
		pageSize: 'pageSize',
		keyword: 'keyword',
		menuKey: 'groupId'
	},
	menuProps: {
		key: 'id',
		label: 'label',
		children: 'children'
	},
	fileProps: {
		key: 'id',
		fileName: 'fileName',
		url: 'url'
	},
	files: {
		doc: {
			icon: 'sc-icon-file-word-2-fill',
			color: '#409eff'
		},
		docx: {
			icon: 'sc-icon-file-word-2-fill',
			color: '#409eff'
		},
		xls: {
			icon: 'sc-icon-file-excel-2-fill',
			color: '#67C23A'
		},
		xlsx: {
			icon: 'sc-icon-file-excel-2-fill',
			color: '#67C23A'
		},
		ppt: {
			icon: 'sc-icon-file-ppt-2-fill',
			color: '#F56C6C'
		},
		pptx: {
			icon: 'sc-icon-file-ppt-2-fill',
			color: '#F56C6C'
		}
	}
}
