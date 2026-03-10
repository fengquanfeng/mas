import { defineStore } from 'pinia';
// 导入 Vite 版 API 模块（结构和 Webpack 版本完全一致）
import API from '@/api/index.js';

/**
 * Pinia API Store：统一管理所有 API 模块，兼容原有调用逻辑
 * 调用方式：API.common.upload → apiStore.api.common.upload
 */
export const useApiStore = defineStore('api', {
  // 状态：挂载完整 API 模块（和原有 API 对象结构一致）
  state: () => ({
    // 核心：api 对象 = 原有 API 模块，1:1 兼容
    api: API,
    // 可选：全局请求加载状态（按需添加）
    loading: {},
  }),

  // 计算属性：简化常用 API 调用（可选）
  getters: {
    // 示例：快速获取 common 模块
    commonApi: (state) => state.api.common,
    // 示例：快速获取 user 模块
    userApi: (state) => state.api.user,
  },

  // 行为：封装通用请求逻辑（可选，推荐添加）
  actions: {
    /**
     * 通用 API 请求封装
     * @param {String} moduleName 模块名（如 'common'）
     * @param {String} methodName 方法名（如 'upload'）
     * @param  {...any} args 请求参数
     * @returns {Promise<any>} 请求结果
     */
    async request(moduleName, methodName, ...args) {
      // 校验模块/方法是否存在
      if (!this.api[moduleName] || !this.api[moduleName][methodName]) {
        console.error(`API 不存在：${moduleName}.${methodName}`);
        return null;
      }

      // 设置加载状态
      const key = `${moduleName}.${methodName}`;
      this.loading[key] = true;

      try {
        // 调用 API 方法（和原有直接调用逻辑一致）
        const result = await this.api[moduleName][methodName](...args);
        return result;
      } catch (error) {
        console.error(`API 请求失败：${key}`, error);
        throw error; // 抛出错误，组件内可捕获
      } finally {
        // 清除加载状态
        this.loading[key] = false;
      }
    },

    // 示例：封装常用请求（简化组件调用）
    async uploadFile(file) {
      return this.request('common', 'upload', file);
    },
  },
});