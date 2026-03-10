import { markRaw } from 'vue';

// ########################## Vite 替代 require.context 核心代码 ##########################
// 1. 加载当前目录下所有 .vue 文件（不遍历子文件夹），eager: true 表示立即加载
const modules = import.meta.glob('./[!.]*.vue', { eager: true }); 
// 说明：./[!.]*.vue 正则含义：
// - ./ ：当前目录
// - [!.] ：排除以 . 开头的文件（如 .DS_Store、.env 等）
// - *.vue ：匹配所有 .vue 文件
// - 无 ** ：表示不遍历子文件夹（对应原代码的 false）

const resultComps = {};

// 2. 遍历模块，生成组件映射表（和原代码逻辑一致）
Object.keys(modules).forEach(fileName => {
  // 获取组件默认导出
  const comp = modules[fileName].default;
  // 提取组件名（如 ./Hello.vue → Hello），和原代码替换逻辑一致
  const compName = fileName.replace(/^\.\/(.*)\.\w+$/, '$1');
  // 用 markRaw 标记为原始对象（避免响应式转换，和原代码一致）
  resultComps[compName] = markRaw(comp);
});

export default resultComps;