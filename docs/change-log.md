# 变更日志 (Change Log)

本文档记录 masServer 项目的所有版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

---

## [v0.1.0] - 2026-03-10

### 初始化版本

#### 新增
- 项目基础架构搭建
- **前端 (frontend/)**：Vue3 + Vite + Element Plus 管理后台
  - 集成 SCUI 组件库
  - 支持 Vue Router、Pinia、Vue I18n
  - 内置富文本编辑器 (TinyMCE)、图表 (ECharts)、代码编辑器 (CodeMirror)
- **后端 (backend/)**：NestJS + TypeORM + MySQL RESTful API
  - 用户认证模块（JWT + Passport）
  - 系统管理模块（用户、角色、菜单、部门、字典、日志）
  - 数据库实体定义与关联关系
- **工程化配置**：
  - 根目录统一 `.gitignore`（覆盖前后端通用及特有规则）
  - 根目录 `package.json` 统一脚本（一键启动/打包/安装）
  - 版本号统一标注规范

#### 技术栈版本
| 组件 | 版本 |
|------|------|
| Vue | 3.5.29 |
| Vite | 7.3.1 |
| Element Plus | 2.2.32 |
| NestJS | 11.0.1 |
| TypeORM | 0.3.28 |
| TypeScript | 5.7.3 |

---

## 版本说明

- **主版本号**：重大架构变更或不兼容修改
- **次版本号**：功能新增（向下兼容）
- **修订号**：问题修复（向下兼容）
