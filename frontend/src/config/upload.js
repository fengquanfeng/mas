import { useApiStore } from '@/store/apiStore';
//文件上传配置

// 延迟获取 API Store 实例（避免在 Pinia 初始化前调用）
const getApiStore = () => useApiStore();

export default {
	// 使用 getter 延迟获取 API 对象
	get apiObj() {
		return getApiStore().api.common.upload;
	},
	filename: "file",					//form请求时文件的key
	successCode: 200,					//请求完成代码
	maxSize: 10,						//最大文件大小 默认10MB
	parseData: function (res) {
		return {
			code: res.code,				//分析状态字段结构
			fileName: res.data.fileName,//分析文件名称
			src: res.data.src,			//分析图片远程地址结构
			msg: res.message			//分析描述字段结构
		}
	},
	get apiObjFile() {
		return getApiStore().api.common.uploadFile;
	},	//附件上传请求API对象
	maxSizeFile: 10						//最大文件大小 默认10MB
}
