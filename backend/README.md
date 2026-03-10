# MAS Server 技术文档

## 项目概述

MAS Server 是基于 NestJS 框架开发的企业级后端服务，为 SCUI 前端项目提供完整的 RESTful API 支持。本项目采用模块化架构设计，支持用户认证、权限管理、系统配置等核心功能。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18.x+ | 运行环境 |
| TypeScript | 5.x | 开发语言 |
| NestJS | 10.x | Web 框架 |
| TypeORM | 0.3.x | ORM 框架 |
| MySQL | 8.x | 数据库 |
| JWT | 9.x | 身份认证 |
| bcryptjs | 2.x | 密码加密 |
| class-validator | 0.14.x | 数据验证 |

## 项目结构

```
masServer/
├── src/
│   ├── auth/                 # 认证模块
│   │   ├── dto/              # 数据传输对象
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── user/                 # 用户实体
│   │   └── user.entity.ts
│   ├── role/                 # 角色实体
│   │   └── role.entity.ts
│   ├── dept/                 # 部门实体
│   │   └── dept.entity.ts
│   ├── menu/                 # 菜单实体
│   │   └── menu.entity.ts
│   ├── dic/                  # 字典模块
│   │   ├── dictionary.entity.ts
│   │   └── dictionary-item.entity.ts
│   ├── log/                  # 日志实体
│   │   └── log.entity.ts
│   ├── config/               # 配置文件
│   │   └── database.config.ts
│   ├── system.controller.ts  # 系统API控制器
│   ├── app.module.ts         # 根模块
│   ├── app.service.ts        # 根服务
│   └── main.ts               # 应用入口
├── .env                      # 环境变量
├── init-database.sql         # 数据库初始化脚本
├── nest-cli.json             # NestJS CLI配置
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript配置
└── README.md                 # 项目文档
```

## 环境配置

### 1. 环境变量 (.env)

```env
# 服务器配置
PORT=3000

# JWT配置
JWT_SECRET=mas-secret-key-2026
JWT_EXPIRES_IN=7d

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_NAME=mas

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. 数据库配置

数据库连接配置位于 `src/config/database.config.ts`：

```typescript
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,  // 开发环境启用，生产环境建议关闭
  logging: true,
  charset: 'utf8mb4',
});
```

## 数据模型

### 1. 用户表 (users)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 用户ID |
| userName | VARCHAR(100) | NOT NULL, UNIQUE | 登录账号 |
| name | VARCHAR(100) | NOT NULL | 用户姓名 |
| password | VARCHAR(100) | NOT NULL | 密码(BCrypt加密) |
| avatar | VARCHAR(255) | NULL | 头像URL |
| mail | VARCHAR(100) | NULL | 邮箱 |
| deptId | VARCHAR(50) | NULL | 部门ID |
| status | TINYINT | DEFAULT 1 | 状态(1:启用,0:禁用) |
| createdAt | DATETIME | NOT NULL | 创建时间 |
| updatedAt | DATETIME | NOT NULL | 更新时间 |

### 2. 角色表 (roles)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 角色ID |
| label | VARCHAR(100) | NOT NULL | 角色名称 |
| alias | VARCHAR(100) | NULL | 角色别名 |
| sort | INT | DEFAULT 0 | 排序号 |
| status | VARCHAR(1) | DEFAULT '1' | 状态 |
| remark | VARCHAR(255) | NULL | 备注 |
| createdAt | DATETIME | NOT NULL | 创建时间 |
| updatedAt | DATETIME | NOT NULL | 更新时间 |

### 3. 部门表 (departments)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 部门ID |
| label | VARCHAR(100) | NOT NULL | 部门名称 |
| parentId | VARCHAR(50) | NULL | 父部门ID |
| remark | VARCHAR(255) | NULL | 备注 |
| status | TINYINT | DEFAULT 1 | 状态 |
| sort | INT | DEFAULT 0 | 排序号 |
| createdAt | DATETIME | NOT NULL | 创建时间 |
| updatedAt | DATETIME | NOT NULL | 更新时间 |

### 4. 菜单表 (menus)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 菜单ID |
| name | VARCHAR(100) | NOT NULL | 菜单标识 |
| path | VARCHAR(255) | NOT NULL | 路由路径 |
| component | VARCHAR(255) | NULL | 组件路径 |
| title | VARCHAR(100) | NULL | 菜单标题 |
| icon | VARCHAR(50) | NULL | 图标 |
| type | VARCHAR(20) | DEFAULT 'menu' | 类型 |
| affix | BOOLEAN | DEFAULT FALSE | 是否固定 |
| tag | VARCHAR(50) | NULL | 标签 |
| hidden | BOOLEAN | DEFAULT FALSE | 是否隐藏 |
| active | VARCHAR(255) | NULL | 激活状态 |
| fullpage | BOOLEAN | DEFAULT FALSE | 是否全屏 |
| parentId | VARCHAR(50) | NULL | 父菜单ID |
| orderNum | INT | DEFAULT 0 | 排序号 |
| status | TINYINT | DEFAULT 1 | 状态 |
| createdAt | DATETIME | NOT NULL | 创建时间 |
| updatedAt | DATETIME | NOT NULL | 更新时间 |

### 5. 字典表 (dictionaries)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 字典ID |
| name | VARCHAR(100) | NOT NULL | 字典名称 |
| code | VARCHAR(100) | NOT NULL, UNIQUE | 字典编码 |
| createdAt | DATETIME | NOT NULL | 创建时间 |
| updatedAt | DATETIME | NOT NULL | 更新时间 |

### 6. 字典项表 (dictionary_items)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 字典项ID |
| dictionaryId | VARCHAR(50) | NOT NULL | 字典ID |
| name | VARCHAR(100) | NOT NULL | 字典项名称 |
| value | VARCHAR(100) | NOT NULL | 字典项值 |
| orderNum | INT | DEFAULT 0 | 排序号 |
| status | TINYINT | DEFAULT 1 | 状态 |
| createdAt | DATETIME | NOT NULL | 创建时间 |
| updatedAt | DATETIME | NOT NULL | 更新时间 |

### 7. 日志表 (logs)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 日志ID |
| level | VARCHAR(20) | NOT NULL | 日志级别 |
| name | VARCHAR(100) | NOT NULL | 操作名称 |
| url | VARCHAR(255) | NULL | 请求URL |
| type | VARCHAR(10) | NULL | 请求类型 |
| code | VARCHAR(10) | NULL | 状态码 |
| cip | VARCHAR(50) | NULL | 客户端IP |
| user | VARCHAR(100) | NULL | 操作用户 |
| time | DATETIME | NULL | 操作时间 |
| createdAt | DATETIME | NOT NULL | 创建时间 |

## API 接口文档

### 1. 认证接口

#### 1.1 用户登录

- **URL**: `POST /api/token`
- **请求参数**:
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userInfo": {
        "id": "1",
        "userName": "admin",
        "name": "管理员",
        "avatar": "img/avatar.jpg",
        "mail": "admin@example.com",
        "deptId": "1",
        "group": ["1"],
        "groupName": "超级管理员"
      }
    },
    "message": ""
  }
  ```

### 2. 系统管理接口

#### 2.1 获取用户列表

- **URL**: `GET /api/system/user/list`
- **请求参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 3,
      "page": 1,
      "pageSize": 20,
      "rows": [
        {
          "id": "1",
          "userName": "admin",
          "name": "管理员",
          "avatar": "img/avatar.jpg",
          "mail": "admin@example.com",
          "dept": "1",
          "group": ["1"],
          "groupName": "超级管理员",
          "date": "2021-10-10T12:00:00.000Z"
        }
      ]
    },
    "message": ""
  }
  ```

#### 2.2 获取角色列表

- **URL**: `GET /api/system/role/list2`
- **请求参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 4,
      "page": 1,
      "pageSize": 20,
      "rows": [
        {
          "id": "1",
          "label": "超级管理员",
          "alias": "SA",
          "sort": 1,
          "status": "1",
          "remark": "内置超级管理员角色",
          "date": "2020-05-07T09:30:00.000Z"
        }
      ]
    },
    "message": ""
  }
  ```

#### 2.3 获取部门列表

- **URL**: `GET /api/system/dept/list`
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": "1",
        "parentId": null,
        "label": "华南分部",
        "remark": "",
        "status": 1,
        "sort": 1,
        "date": "2022-10-10T08:00:00.000Z",
        "children": [
          {
            "id": "11",
            "parentId": "1",
            "label": "售前客服部",
            "remark": "",
            "status": 1,
            "sort": 2,
            "date": "2022-10-10T08:00:00.000Z",
            "children": []
          }
        ]
      }
    ],
    "message": ""
  }
  ```

#### 2.4 获取我的菜单

- **URL**: `GET /api/system/menu/my/1.6.1`
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "menu": [
        {
          "name": "home",
          "path": "/home",
          "meta": {
            "title": "首页",
            "icon": "el-icon-eleme-filled",
            "type": "menu"
          },
          "children": [
            {
              "name": "dashboard",
              "path": "/dashboard",
              "component": "home",
              "meta": {
                "title": "控制台",
                "icon": "el-icon-menu",
                "type": "menu",
                "affix": true
              },
              "children": []
            }
          ]
        }
      ],
      "permissions": ["list.add", "list.edit", "list.delete", "user.add", "user.edit", "user.delete"],
      "dashboardGrid": ["welcome", "ver", "time", "progress", "echarts", "about"]
    },
    "message": ""
  }
  ```

#### 2.5 获取菜单列表

- **URL**: `GET /api/system/menu/list`
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": "1",
        "name": "home",
        "path": "/home",
        "title": "首页",
        "icon": "el-icon-eleme-filled",
        "type": "menu",
        "parentId": null,
        "orderNum": 1,
        "status": 1,
        "children": []
      }
    ],
    "message": ""
  }
  ```

#### 2.6 获取字典树

- **URL**: `GET /api/system/dic/tree`
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": "1",
        "code": "notice",
        "name": "通知类型"
      },
      {
        "id": "4",
        "code": "userType",
        "name": "用户类型",
        "children": [
          {
            "id": "41",
            "code": "userTypePC",
            "name": "Desktop"
          }
        ]
      }
    ],
    "message": ""
  }
  ```

#### 2.7 获取字典列表

- **URL**: `GET /api/system/dic/list`
- **请求参数**:
  - `code`: 字典编码
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": "41",
        "name": "Desktop",
        "value": "userTypePC"
      }
    ],
    "message": ""
  }
  ```

#### 2.8 获取日志列表

- **URL**: `GET /api/system/log/list`
- **请求参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 3,
      "page": 1,
      "pageSize": 20,
      "rows": [
        {
          "id": "210000200807261646",
          "level": "error",
          "name": "用户登录",
          "url": "/oauth/token",
          "type": "GET",
          "code": "401",
          "cip": "194.66.51.19",
          "user": "赵平",
          "time": "1995-12-27T08:55:12.000Z"
        }
      ]
    },
    "message": ""
  }
  ```

## 快速开始

### 1. 安装依赖

```bash
cd masServer
npm install
```

### 2. 配置数据库

确保 MySQL 服务已启动，并创建数据库：

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mas DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

或者执行初始化脚本：

```bash
mysql -u root -p < init-database.sql
```

### 3. 配置环境变量

编辑 `.env` 文件，配置数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=mas
```

### 4. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后，访问 http://localhost:3000

### 5. 测试接口

```bash
curl -X POST http://localhost:3000/api/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

## 默认账号

- **用户名**: admin
- **密码**: 123456

## 开发规范

### 1. 代码风格

- 使用 TypeScript 严格模式
- 遵循 NestJS 官方编码规范
- 使用 ESLint 进行代码检查

### 2. 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

### 3. 分支管理

- main: 主分支，生产环境
- develop: 开发分支
- feature/*: 功能分支
- bugfix/*: 修复分支

## 部署指南

### 1. 生产环境配置

1. 修改 `.env` 文件：
   - 关闭 `synchronize: false`
   - 设置 `logging: false`
   - 配置生产数据库连接

2. 构建项目：
   ```bash
   npm run build
   ```

3. 使用 PM2 启动：
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name mas-server
   ```

### 2. Nginx 反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 常见问题

### 1. 数据库连接失败

- 检查 MySQL 服务是否启动
- 检查数据库配置是否正确
- 检查数据库是否存在

### 2. 端口被占用

- 修改 `.env` 中的 `PORT` 配置
- 或者关闭占用 3000 端口的进程

### 3. 跨域问题

服务已默认启用 CORS，如需配置特定域名，修改 `main.ts`：

```typescript
app.enableCors({
  origin: ['http://localhost:2800', 'https://yourdomain.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

## 更新日志

### v1.0.0 (2026-03-08)

- 初始版本发布
- 实现用户认证功能
- 实现系统管理功能（用户、角色、部门、菜单、字典、日志）
- 集成 JWT 认证
- 集成 TypeORM

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

- 项目地址: https://github.com/yourusername/masServer
- 问题反馈: https://github.com/yourusername/masServer/issues
- 邮箱: your.email@example.com

---

**注意**: 本文档最后更新于 2026-03-08
