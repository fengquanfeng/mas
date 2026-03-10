# masServer 前后端一体化项目

> **当前版本：v0.1.0**
> 📋 迭代说明：详见 [docs/change-log.md](./docs/change-log.md)

---

## 项目简介

本项目是 mas 前后端一体化解决方案，包含：

- **前端 (frontend/)**：基于 Vue3 + Vite + Element Plus 的现代化管理后台
- **后端 (backend/)**：基于 NestJS + TypeORM + MySQL 的 RESTful API 服务

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0

### 一键安装依赖

```bash
npm run install:all
```

### 开发模式启动

```bash
# 同时启动前后端
npm run start:all

# 或单独启动
npm run start:frontend   # 前端开发服务器
npm run start:backend    # 后端开发服务器（热重载）
```

### 打包构建

```bash
# 分别打包
npm run build:frontend
npm run build:backend

# 或一键打包全部
npm run build:all
```

---

## 项目结构

```
mas/
├── frontend/          # Vue3 前端项目
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # NestJS 后端项目
│   ├── src/
│   ├── test/
│   └── package.json
├── docs/              # 项目文档
│   └── change-log.md  # 版本变更日志
├── package.json       # 根目录统一脚本
└── README.md          # 本文件
```

---

## 技术栈

| 层级      | 技术                    |
| --------- | ----------------------- |
| 前端框架  | Vue 3.5.29 + Vite 7.3.1 |
| UI 组件库 | Element Plus 2.2.32     |
| 状态管理  | Pinia 3.0.4             |
| 后端框架  | NestJS 11.x             |
| ORM       | TypeORM 0.3.28          |
| 数据库    | MySQL 8.x               |
| 认证      | JWT + Passport          |

---

## 更新日志

详见 [docs/change-log.md](./docs/change-log.md)
