# DIC 字典模块后端 API 文档

> 版本：v1.2.0 | 日期：2026-03-10 | 技术栈：NestJS@11.0.1、TypeORM@0.3.28、MySQL@8.0

---

## 一、模块概述

### 1.1 功能说明

字典模块提供系统级的数据字典管理功能，用于维护各类枚举值、状态码、配置项等基础数据。

**核心功能**：
- **字典分类管理**：创建、编辑、删除字典分类
- **字典项管理**：维护字典下的具体选项值
- **树形结构支持**：支持多级字典分类
- **排序与状态**：支持字典项拖拽排序和启用/禁用状态控制

### 1.2 使用场景

| 场景 | 示例 |
|------|------|
| 状态枚举 | 用户状态（启用/禁用）、订单状态（待付款/已发货） |
| 类型配置 | 用户类型（普通/VIP）、消息类型（系统/私信） |
| 系统配置 | 性别（男/女/保密）、学历（本科/硕士/博士） |
| 业务选项 | 产品分类、地区编码、支付方式 |

---

## 二、实体定义文档

### 2.1 Dictionary（字典实体）

**文件路径**：`backend/src/dic/dictionary.entity.ts`

| 字段名 | 类型 | 长度 | 是否非空 | 默认值 | 注释 |
|--------|------|------|----------|--------|------|
| id | int | - | 是 | 自增 | 主键，字典自增ID |
| name | varchar | 100 | 是 | - | 字典名称（唯一） |
| code | varchar | 100 | 否 | null | 字典编码，自动生成 |
| createdAt | datetime | - | 是 | 当前时间 | 创建时间 |
| updatedAt | datetime | - | 是 | 当前时间 | 更新时间 |
| items | relation | - | 否 | - | 关联的字典项列表（OneToMany） |

**实体关系**：
- `Dictionary` (1) ←→ (N) `DictionaryItem`

### 2.2 DictionaryItem（字典项实体）

**文件路径**：`backend/src/dic/dictionary-item.entity.ts`

| 字段名 | 类型 | 长度 | 是否非空 | 默认值 | 注释 |
|--------|------|------|----------|--------|------|
| id | varchar | 50 | 是 | - | 主键，字典项唯一标识 |
| dictionaryId | varchar | 50 | 是 | - | 所属字典ID，外键关联 |
| name | varchar | 100 | 是 | - | 字典项显示名称 |
| value | varchar | 100 | 是 | - | 字典项值（存储值） |
| orderNum | int | - | 否 | 0 | 排序序号，数值越小越靠前 |
| status | tinyint | - | 否 | 1 | 状态：0-禁用，1-启用 |
| createdAt | datetime | - | 是 | 当前时间 | 创建时间 |
| updatedAt | datetime | - | 是 | 当前时间 | 更新时间 |
| dictionary | relation | - | 否 | - | 所属字典（ManyToOne） |

---

## 三、API 接口文档

**基础路径**：`/dic`

### 3.1 字典分类接口

#### 3.1.1 获取字典树

- **接口路径**：`GET /dic/tree`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：无
- **响应示例（成功）**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "user_status",
      "name": "用户状态",
      "code": "user_status",
      "createdAt": "2026-03-10T08:00:00.000Z",
      "updatedAt": "2026-03-10T08:00:00.000Z",
      "items": [
        {
          "id": "us_001",
          "dictionaryId": "user_status",
          "name": "启用",
          "value": "1",
          "orderNum": 0,
          "status": 1,
          "createdAt": "2026-03-10T08:00:00.000Z",
          "updatedAt": "2026-03-10T08:00:00.000Z"
        }
      ]
    }
  ]
}
```

- **状态码**：
  - `200`：请求成功
  - `401`：未授权
  - `500`：服务器内部错误

---

#### 3.1.2 获取字典详情

- **接口路径**：`GET /dic/:code`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 字典编码 |

- **响应示例（成功）**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_status",
    "name": "用户状态",
    "code": "user_status",
    "createdAt": "2026-03-10T08:00:00.000Z",
    "updatedAt": "2026-03-10T08:00:00.000Z",
    "items": [
      {
        "id": "us_001",
        "dictionaryId": "user_status",
        "name": "启用",
        "value": "1",
        "orderNum": 0,
        "status": 1,
        "createdAt": "2026-03-10T08:00:00.000Z",
        "updatedAt": "2026-03-10T08:00:00.000Z"
      }
    ]
  }
}
```

- **响应示例（失败 - 字典不存在）**：

```json
{
  "code": 404,
  "message": "字典 user_status 不存在",
  "error": "Not Found"
}
```

- **状态码**：
  - `200`：请求成功
  - `401`：未授权
  - `404`：字典不存在
  - `500`：服务器内部错误

---

#### 3.1.3 创建字典

- **接口路径**：`POST /dic`
- **请求方式**：POST
- **请求头**：
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **请求参数（Body）**：

| 参数名 | 类型 | 必填 | 长度限制 | 说明 |
|--------|------|------|----------|------|
| name | string | 是 | 最大100 | 字典名称（全局唯一） |
| code | string | 否 | 最大100 | 字典编码，不传则自动生成 |
| parentId | string | 否 | 最大50 | 父级字典ID，支持树形结构 |

- **请求示例**：

```json
{
  "name": "用户类型",
  "code": "user_type"
}
```

- **响应示例（成功）**：

```json
{
  "code": 201,
  "message": "success",
  "data": {
    "id": 1,
    "name": "用户类型",
    "code": "user_type",
    "createdAt": "2026-03-10T08:00:00.000Z",
    "updatedAt": "2026-03-10T08:00:00.000Z"
  }
}
```

- **响应示例（失败 - 名称已存在）**：

```json
{
  "code": 409,
  "message": "字典名称已存在",
  "error": "Conflict"
}
```

- **状态码**：
  - `201`：创建成功
  - `400`：请求参数错误
  - `401`：未授权
  - `409`：字典名称已存在
  - `500`：服务器内部错误

---

#### 3.1.4 更新字典

- **接口路径**：`PUT /dic/:id`
- **请求方式**：PUT
- **请求头**：
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 字典ID |

- **请求参数（Body）**：

| 参数名 | 类型 | 必填 | 长度限制 | 说明 |
|--------|------|------|----------|------|
| name | string | 否 | 最大100 | 字典名称 |
| code | string | 否 | 最大100 | 字典编码 |
| parentId | string | 否 | 最大50 | 父级字典ID |

- **请求示例**：

```json
{
  "name": "用户类型（已修改）",
  "code": "user_type_v2"
}
```

- **响应示例（成功）**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_type",
    "name": "用户类型（已修改）",
    "code": "user_type_v2",
    "createdAt": "2026-03-10T08:00:00.000Z",
    "updatedAt": "2026-03-10T09:00:00.000Z"
  }
}
```

- **响应示例（失败 - 字典不存在）**：

```json
{
  "code": 404,
  "message": "字典 user_type 不存在",
  "error": "Not Found"
}
```

- **状态码**：
  - `200`：更新成功
  - `400`：请求参数错误
  - `401`：未授权
  - `404`：字典不存在
  - `500`：服务器内部错误

---

#### 3.1.5 删除字典

- **接口路径**：`DELETE /dic/:id`
- **请求方式**：DELETE
- **请求头**：`Authorization: Bearer {token}`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 字典ID |

- **响应示例（成功）**：

```json
{
  "code": 204,
  "message": "success"
}
```

- **响应示例（失败 - 字典不存在）**：

```json
{
  "code": 404,
  "message": "字典 user_type 不存在",
  "error": "Not Found"
}
```

- **状态码**：
  - `204`：删除成功
  - `401`：未授权
  - `404`：字典不存在
  - `500`：服务器内部错误

**注意**：删除字典时会级联删除其下的所有字典项。

---

### 3.2 字典项接口

#### 3.2.1 获取字典项列表

- **接口路径**：`GET /dic/:code/items`
- **请求方式**：GET
- **请求头**：`Authorization: Bearer {token}`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 字典编码 |

- **响应示例（成功）**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "ut_001",
      "dictionaryId": "user_type",
      "name": "普通用户",
      "value": "1",
      "orderNum": 0,
      "status": 1,
      "createdAt": "2026-03-10T08:00:00.000Z",
      "updatedAt": "2026-03-10T08:00:00.000Z"
    },
    {
      "id": "ut_002",
      "dictionaryId": "user_type",
      "name": "VIP用户",
      "value": "2",
      "orderNum": 1,
      "status": 1,
      "createdAt": "2026-03-10T08:00:00.000Z",
      "updatedAt": "2026-03-10T08:00:00.000Z"
    }
  ]
}
```

- **状态码**：
  - `200`：请求成功
  - `401`：未授权
  - `404`：字典不存在
  - `500`：服务器内部错误

---

#### 3.2.2 创建字典项

- **接口路径**：`POST /dic/items`
- **请求方式**：POST
- **请求头**：
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **请求参数（Body）**：

| 参数名 | 类型 | 必填 | 长度限制 | 说明 |
|--------|------|------|----------|------|
| id | string | 是 | 最大50 | 字典项唯一标识 |
| dictionaryId | string | 是 | 最大50 | 所属字典ID |
| name | string | 是 | 最大100 | 字典项显示名称 |
| value | string | 是 | 最大100 | 字典项值 |
| orderNum | number | 否 | - | 排序序号，默认0 |
| status | number | 否 | 0或1 | 状态，默认1（启用） |

- **请求示例**：

```json
{
  "id": "ut_003",
  "dictionaryId": "user_type",
  "name": "企业用户",
  "value": "3",
  "orderNum": 2,
  "status": 1
}
```

- **响应示例（成功）**：

```json
{
  "code": 201,
  "message": "success",
  "data": {
    "id": "ut_003",
    "dictionaryId": "user_type",
    "name": "企业用户",
    "value": "3",
    "orderNum": 2,
    "status": 1,
    "createdAt": "2026-03-10T08:00:00.000Z",
    "updatedAt": "2026-03-10T08:00:00.000Z"
  }
}
```

- **状态码**：
  - `201`：创建成功
  - `400`：请求参数错误
  - `401`：未授权
  - `500`：服务器内部错误

---

#### 3.2.3 更新字典项

- **接口路径**：`PUT /dic/items/:id`
- **请求方式**：PUT
- **请求头**：
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 字典项ID |

- **请求参数（Body）**：

| 参数名 | 类型 | 必填 | 长度限制 | 说明 |
|--------|------|------|----------|------|
| name | string | 否 | 最大100 | 字典项显示名称 |
| value | string | 否 | 最大100 | 字典项值 |
| orderNum | number | 否 | - | 排序序号 |
| status | number | 否 | 0或1 | 状态 |

- **请求示例**：

```json
{
  "name": "企业VIP用户",
  "value": "3"
}
```

- **响应示例（成功）**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "ut_003",
    "dictionaryId": "user_type",
    "name": "企业VIP用户",
    "value": "3",
    "orderNum": 2,
    "status": 1,
    "createdAt": "2026-03-10T08:00:00.000Z",
    "updatedAt": "2026-03-10T09:00:00.000Z"
  }
}
```

- **响应示例（失败 - 字典项不存在）**：

```json
{
  "code": 404,
  "message": "字典项 ut_003 不存在",
  "error": "Not Found"
}
```

- **状态码**：
  - `200`：更新成功
  - `400`：请求参数错误
  - `401`：未授权
  - `404`：字典项不存在
  - `500`：服务器内部错误

---

#### 3.2.4 删除字典项

- **接口路径**：`DELETE /dic/items/:id`
- **请求方式**：DELETE
- **请求头**：`Authorization: Bearer {token}`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 字典项ID |

- **响应示例（成功）**：

```json
{
  "code": 204,
  "message": "success"
}
```

- **响应示例（失败 - 字典项不存在）**：

```json
{
  "code": 404,
  "message": "字典项 ut_003 不存在",
  "error": "Not Found"
}
```

- **状态码**：
  - `204`：删除成功
  - `401`：未授权
  - `404`：字典项不存在
  - `500`：服务器内部错误

---

#### 3.2.5 更新字典项排序

- **接口路径**：`PUT /dic/items/:id/sort`
- **请求方式**：PUT
- **请求头**：
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 字典项ID |

- **请求参数（Body）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderNum | number | 是 | 新的排序序号 |

- **请求示例**：

```json
{
  "orderNum": 5
}
```

- **响应示例（成功）**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "ut_003",
    "dictionaryId": "user_type",
    "name": "企业VIP用户",
    "value": "3",
    "orderNum": 5,
    "status": 1,
    "createdAt": "2026-03-10T08:00:00.000Z",
    "updatedAt": "2026-03-10T09:00:00.000Z"
  }
}
```

- **状态码**：
  - `200`：更新成功
  - `400`：请求参数错误
  - `401`：未授权
  - `404`：字典项不存在
  - `500`：服务器内部错误

---

#### 3.2.6 更新字典项状态

- **接口路径**：`PUT /dic/items/:id/status`
- **请求方式**：PUT
- **请求头**：
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **请求参数（Path）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 字典项ID |

- **请求参数（Body）**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 状态：0-禁用，1-启用 |

- **请求示例**：

```json
{
  "status": 0
}
```

- **响应示例（成功）**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "ut_003",
    "dictionaryId": "user_type",
    "name": "企业VIP用户",
    "value": "3",
    "orderNum": 5,
    "status": 0,
    "createdAt": "2026-03-10T08:00:00.000Z",
    "updatedAt": "2026-03-10T09:00:00.000Z"
  }
}
```

- **状态码**：
  - `200`：更新成功
  - `400`：请求参数错误
  - `401`：未授权
  - `404`：字典项不存在
  - `500`：服务器内部错误

---

## 四、代码实现细节

### 4.1 代码目录结构

```
backend/src/dic/
├── dto/                              # 数据传输对象
│   ├── create-dictionary.dto.ts      # 创建字典DTO
│   ├── update-dictionary.dto.ts      # 更新字典DTO
│   ├── create-dictionary-item.dto.ts # 创建字典项DTO
│   └── update-dictionary-item.dto.ts # 更新字典项DTO
├── dic.controller.ts                 # 控制器（路由处理）
├── dic.module.ts                     # 模块定义
├── dic.service.ts                    # 服务层（业务逻辑）
├── dictionary.entity.ts              # 字典实体
└── dictionary-item.entity.ts         # 字典项实体
```

---

### 4.2 DTO 定义详情

#### 4.2.1 CreateDictionaryDto（创建字典DTO）

**文件路径**：[backend/src/dic/dto/create-dictionary.dto.ts](file:///d:\devs\mas\backend\src\dic\dto\create-dictionary.dto.ts)

| 字段名 | 类型 | 必填 | 验证规则 | 说明 |
|--------|------|------|----------|------|
| name | string | 是 | `@IsString` `@IsNotEmpty` `@MaxLength(100)` | 字典名称（全局唯一） |
| code | string | 否 | `@IsString` `@IsOptional` `@MaxLength(100)` | 字典编码，不传则自动生成 |

**代码实现**：

```typescript
export class CreateDictionaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;
}
```

---

#### 4.2.2 UpdateDictionaryDto（更新字典DTO）

**文件路径**：[backend/src/dic/dto/update-dictionary.dto.ts](file:///d:\devs\mas\backend\src\dic\dto\update-dictionary.dto.ts)

| 字段名 | 类型 | 必填 | 验证规则 | 说明 |
|--------|------|------|----------|------|
| name | string | 否 | `@IsString` `@IsOptional` `@MaxLength(100)` | 字典名称 |
| code | string | 否 | `@IsString` `@IsOptional` `@MaxLength(100)` | 字典编码 |

**代码实现**：

```typescript
export class UpdateDictionaryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;
}
```

---

#### 4.2.3 CreateDictionaryItemDto（创建字典项DTO）

**文件路径**：[backend/src/dic/dto/create-dictionary-item.dto.ts](file:///d:\devs\mas\backend\src\dic\dto\create-dictionary-item.dto.ts)

| 字段名 | 类型 | 必填 | 验证规则 | 说明 |
|--------|------|------|----------|------|
| id | string | 是 | `@IsString` `@IsNotEmpty` `@MaxLength(50)` | 字典项唯一标识 |
| dictionaryId | string | 是 | `@IsString` `@IsNotEmpty` `@MaxLength(50)` | 所属字典ID |
| name | string | 是 | `@IsString` `@IsNotEmpty` `@MaxLength(100)` | 字典项显示名称 |
| value | string | 是 | `@IsString` `@IsNotEmpty` `@MaxLength(100)` | 字典项值 |
| orderNum | number | 否 | `@IsInt` `@IsOptional` `@Min(0)` | 排序序号，默认0 |
| status | number | 否 | `@IsInt` `@IsOptional` `@Min(0)` `@Max(1)` | 状态，默认1（启用） |

**代码实现**：

```typescript
export class CreateDictionaryItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  dictionaryId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderNum?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;
}
```

---

#### 4.2.4 UpdateDictionaryItemDto（更新字典项DTO）

**文件路径**：[backend/src/dic/dto/update-dictionary-item.dto.ts](file:///d:\devs\mas\backend\src\dic\dto\update-dictionary-item.dto.ts)

| 字段名 | 类型 | 必填 | 验证规则 | 说明 |
|--------|------|------|----------|------|
| dictionaryId | string | 否 | `@IsString` `@IsOptional` `@MaxLength(50)` | 所属字典ID |
| name | string | 否 | `@IsString` `@IsOptional` `@MaxLength(100)` | 字典项显示名称 |
| value | string | 否 | `@IsString` `@IsOptional` `@MaxLength(100)` | 字典项值 |
| orderNum | number | 否 | `@IsInt` `@IsOptional` `@Min(0)` | 排序序号 |
| status | number | 否 | `@IsInt` `@IsOptional` `@Min(0)` `@Max(1)` | 状态（0-禁用，1-启用） |

**代码实现**：

```typescript
export class UpdateDictionaryItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  dictionaryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  value?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderNum?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;
}
```

---

### 4.3 Service 层方法说明

**文件路径**：[backend/src/dic/dic.service.ts](file:///d:\devs\mas\backend\src\dic\dic.service.ts)

**依赖注入**：

```typescript
@Injectable()
export class DicService {
  constructor(
    @InjectRepository(Dictionary)
    private dictionaryRepository: Repository<Dictionary>,
    @InjectRepository(DictionaryItem)
    private dictionaryItemRepository: Repository<DictionaryItem>,
  ) {}
}
```

#### 4.3.1 字典分类相关方法

| 方法名 | 参数 | 返回值 | 功能说明 |
|--------|------|--------|----------|
| `findAllTrees()` | 无 | `Promise<Dictionary[]>` | 获取所有字典列表（平级），按创建时间升序排列 |
| `findOneByCode(code: string)` | `code` - 字典编码 | `Promise<DictionaryDetail>` | 根据编码获取字典详情，字典不存在时抛出404异常 |
| `createDictionary(createDictionaryDto: CreateDictionaryDto)` | `createDictionaryDto` - 创建字典DTO | `Promise<Dictionary>` | 创建字典，自动生成code，校验名称唯一性 |
| `updateDictionary(id: string, updateDictionaryDto: UpdateDictionaryDto)` | `id` - 字典ID<br>`updateDictionaryDto` - 更新字典DTO | `Promise<Dictionary>` | 更新字典，检查字典是否存在 |
| `removeDictionary(id: string)` | `id` - 字典ID | `Promise<{id, message}>` | 删除字典及其关联的所有字典项，字典不存在时抛出404异常 |
| `generateCode(name: string)` | `name` - 字典名称 | `string` | 私有方法，根据名称生成拼音编码 |

**方法详情**：

**`findAllTrees`**：
- 返回平级字典列表，不再包含字典项作为 children
- 字典按 `createdAt` 升序排序

**`createDictionary`**：
- 自动生成 `code`：将名称转换为拼音，已存在则追加序号
- 业务校验：检查 `name` 是否已存在，存在则抛出 `HttpException(409)`
- code 生成规则：拼音全小写，重复时追加 `-1`、`-2` 等序号

**`generateCode`**（私有方法）：
- 将字典名称转换为拼音（全小写）
- 若拼音编码已存在，自动追加 `-1`、`-2` 等序号
- 示例：`用户类型` -> `yonghuleixing`，已存在则 -> `yonghuleixing-1`

**`removeDictionary`**：
- 先查询字典及其关联的字典项
- 级联删除：先删除字典项，再删除字典

---

#### 4.3.2 字典项相关方法

| 方法名 | 参数 | 返回值 | 功能说明 |
|--------|------|--------|----------|
| `findItemsByDictionaryCode(code: string)` | `code` - 字典编码 | `Promise<{dictionaryId, dictionaryCode, dictionaryName, items}>` | 根据字典编码获取字典项列表，按orderNum排序 |
| `findOneItem(id: string)` | `id` - 字典项ID | `Promise<DictionaryItemDetail>` | 根据ID获取字典项详情，包含所属字典信息 |
| `createItem(createDictionaryItemDto: CreateDictionaryItemDto)` | `createDictionaryItemDto` - 创建字典项DTO | `Promise<DictionaryItem>` | 创建字典项，检查所属字典是否存在，ID是否重复 |
| `updateItem(id: string, updateDictionaryItemDto: UpdateDictionaryItemDto)` | `id` - 字典项ID<br>`updateDictionaryItemDto` - 更新字典项DTO | `Promise<DictionaryItem>` | 更新字典项，支持更换所属字典 |
| `removeItem(id: string)` | `id` - 字典项ID | `Promise<{id, message}>` | 删除字典项 |
| `updateItemSort(id: string, orderNum: number)` | `id` - 字典项ID<br>`orderNum` - 排序号 | `Promise<{id, orderNum, message}>` | 更新字典项排序号 |
| `updateItemStatus(id: string, status: number)` | `id` - 字典项ID<br>`status` - 状态（0/1） | `Promise<{id, status, message}>` | 更新字典项启用/禁用状态 |

**方法详情**：

**`createItem`**：
- 检查所属字典是否存在，不存在抛出 `HttpException(404)`
- 检查字典项ID是否已存在，存在抛出 `HttpException(400)`
- `orderNum` 默认值为0，`status` 默认值为1

**`updateItem`**：
- 支持更换所属字典（更新 `dictionaryId`）
- 更换字典时校验新字典是否存在

---

### 4.4 Controller 路由映射

**文件路径**：[backend/src/dic/dic.controller.ts](file:///d:\devs\mas\backend\src\dic\dic.controller.ts)

**基础路径**：`@Controller('api/dic')` → `/api/dic`

#### 4.4.1 字典分类路由

| 路由 | 方法 | 处理函数 | 说明 |
|------|------|----------|------|
| `GET /api/dic/tree` | `@Get('tree')` | `findAllTrees()` | 获取字典树 |
| `GET /api/dic/:code` | `@Get(':code')` | `findOneByCode(code)` | 根据编码获取字典详情 |
| `POST /api/dic` | `@Post()` | `createDictionary(dto)` | 创建字典 |
| `PUT /api/dic/:id` | `@Put(':id')` | `updateDictionary(id, dto)` | 更新字典 |
| `DELETE /api/dic/:id` | `@Delete(':id')` | `removeDictionary(id)` | 删除字典 |

#### 4.4.2 字典项路由

| 路由 | 方法 | 处理函数 | 说明 |
|------|------|----------|------|
| `GET /api/dic/:code/items` | `@Get(':code/items')` | `findItemsByDictionaryCode(code)` | 获取字典项列表 |
| `POST /api/dic/items` | `@Post('items')` | `createItem(dto)` | 创建字典项 |
| `PUT /api/dic/items/:id` | `@Put('items/:id')` | `updateItem(id, dto)` | 更新字典项 |
| `DELETE /api/dic/items/:id` | `@Delete('items/:id')` | `removeItem(id)` | 删除字典项 |
| `PUT /api/dic/items/:id/sort` | `@Put('items/:id/sort')` | `updateItemSort(id, orderNum)` | 更新排序，校验 `orderNum >= 0` |
| `PUT /api/dic/items/:id/status` | `@Put('items/:id/status')` | `updateItemStatus(id, status)` | 更新状态，校验 `status ∈ [0, 1]` |

**异常处理**：
- 所有路由统一使用 `try-catch` 包裹
- Service 层抛出的 `HttpException` 直接透传
- 其他异常统一转换为 `HttpException(500)`

---

### 4.5 模块依赖关系

**文件路径**：[backend/src/dic/dic.module.ts](file:///d:\devs\mas\backend\src\dic\dic.module.ts)

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Dictionary, DictionaryItem]),
  ],
  controllers: [DicController],
  providers: [DicService],
  exports: [DicService],
})
export class DicModule {}
```

**依赖说明**：

| 属性 | 说明 |
|------|------|
| `imports` | 导入 `TypeOrmModule.forFeature([Dictionary, DictionaryItem])`，注册实体仓库 |
| `controllers` | 注册 `DicController`，处理HTTP请求 |
| `providers` | 注册 `DicService`，提供业务逻辑服务 |
| `exports` | 导出 `DicService`，供其他模块使用 |

**外部依赖**：
- `@nestjs/typeorm`：TypeORM 集成模块
- `Dictionary`：字典实体类
- `DictionaryItem`：字典项实体类

---

## 五、数据关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dictionary                               │
│                      (字典分类表)                                │
├─────────────────────────────────────────────────────────────────┤
│  PK  id          int             主键，自增                      │
│  UQ  name        varchar(100)    字典名称（唯一）                 │
│      code        varchar(100)    字典编码（自动生成，可空）        │
│      createdAt   datetime        创建时间                        │
│      updatedAt   datetime        更新时间                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ OneToMany
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DictionaryItem                             │
│                      (字典项表)                                  │
├─────────────────────────────────────────────────────────────────┤
│  PK  id            varchar(50)    主键                          │
│  FK  dictionaryId  varchar(50)    所属字典ID                     │
│      name          varchar(100)   字典项名称                     │
│      value         varchar(100)   字典项值                       │
│      orderNum      int            排序序号（默认0）               │
│      status        tinyint        状态（0-禁用，1-启用）          │
│      createdAt     datetime       创建时间                       │
│      updatedAt     datetime       更新时间                       │
└─────────────────────────────────────────────────────────────────┘
```

**关系说明**：
- 一个字典分类（Dictionary）可以包含多个字典项（DictionaryItem）
- 字典项通过 `dictionaryId` 外键关联到字典分类
- 删除字典时会级联删除其下的所有字典项

---

## 六、数据库表结构

### 6.1 dictionaries（字典分类表）

```sql
CREATE TABLE `dictionaries` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID，自增',
  `name` varchar(100) NOT NULL COMMENT '字典名称',
  `code` varchar(100) DEFAULT NULL COMMENT '字典编码，自动生成',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_name` (`name`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典分类表';
```

**索引说明**：
| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| PRIMARY | 主键 | id | 主键索引，自增 |
| UQ_name | 唯一索引 | name | 字典名称唯一约束 |
| idx_code | 普通索引 | code | 字典编码查询索引 |

### 6.2 dictionary_items（字典项表）

```sql
CREATE TABLE `dictionary_items` (
  `id` varchar(50) NOT NULL COMMENT '主键ID',
  `dictionaryId` varchar(50) NOT NULL COMMENT '所属字典ID',
  `name` varchar(100) NOT NULL COMMENT '字典项名称',
  `value` varchar(100) NOT NULL COMMENT '字典项值',
  `orderNum` int NOT NULL DEFAULT '0' COMMENT '排序序号',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_dictionaryId` (`dictionaryId`),
  KEY `idx_status` (`status`),
  KEY `idx_orderNum` (`orderNum`),
  CONSTRAINT `fk_dictionary_items_dictionary` FOREIGN KEY (`dictionaryId`) REFERENCES `dictionaries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典项表';
```

**索引说明**：
| 索引名 | 类型 | 字段 | 说明 |
|--------|------|------|------|
| PRIMARY | 主键 | id | 主键索引 |
| idx_dictionaryId | 普通索引 | dictionaryId | 字典ID查询索引 |
| idx_status | 普通索引 | status | 状态查询索引 |
| idx_orderNum | 普通索引 | orderNum | 排序查询索引 |
| fk_dictionary_items_dictionary | 外键 | dictionaryId | 关联字典表，级联删除 |

---

## 七、接口汇总表

| 序号 | 功能 | 方法 | 路径 | 状态码 |
|------|------|------|------|--------|
| 1 | 获取字典树 | GET | `/dic/tree` | 200 |
| 2 | 获取字典详情 | GET | `/dic/:code` | 200/404 |
| 3 | 创建字典 | POST | `/dic` | 201/400/409 |
| 4 | 更新字典 | PUT | `/dic/:id` | 200/400/404 |
| 5 | 删除字典 | DELETE | `/dic/:id` | 204/404 |
| 6 | 获取字典项列表 | GET | `/dic/:code/items` | 200/404 |
| 7 | 创建字典项 | POST | `/dic/items` | 201/400 |
| 8 | 更新字典项 | PUT | `/dic/items/:id` | 200/400/404 |
| 9 | 删除字典项 | DELETE | `/dic/items/:id` | 204/404 |
| 10 | 更新字典项排序 | PUT | `/dic/items/:id/sort` | 200/400/404 |
| 11 | 更新字典项状态 | PUT | `/dic/items/:id/status` | 200/400/404 |

---

## 八、迭代变更记录

### v1.2.0（2026-03-10）

**修改内容**：
- **dictionary.entity.ts**：
  - `id` 字段改为自增（`int` + `@PrimaryGeneratedColumn`）
  - `code` 字段改为可空（`nullable: true`）
  - `name` 字段添加唯一约束
- **create-dictionary.dto.ts**：
  - 移除 `id` 字段（改为后端自动生成）
  - `code` 改为可选（`@IsOptional`）
- **dic.service.ts**：
  - `findAllTrees()` 不再返回字典项作为 children，只返回平级字典列表
  - `createDictionary()` 新增自动生成 code 逻辑（拼音转换）
  - `createDictionary()` 新增名称唯一性校验（409 冲突）
  - 新增 `generateCode()` 私有方法（拼音生成 + 序号去重）

**修改前/修改后对比**：

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| 字典ID | 手动传入 varchar(50) | 自增 int |
| 字典编码 | 必填，手动输入 | 可选，自动生成（拼音） |
| 唯一校验 | code 唯一 | name 唯一 |
| 字典列表 | 返回树形（含 children） | 返回平级列表 |
| 创建校验 | 校验 code/id 重复 | 校验 name 重复，自动生成 code |

---

### v1.1.0（2026-03-10）

**新增内容**：
- 代码实现细节章节（第四章）
- DTO 定义详情：4 个 DTO 的字段、类型、验证规则完整说明
- Service 层方法说明：12 个方法的参数、返回值、功能说明
- Controller 路由映射：11 个路由与方法的对应关系表
- 模块依赖关系：DicModule 的依赖注入说明
- 代码目录结构：完整的文件结构树

---

### v1.0.0（2026-03-10）

**新增内容**：
- 模块概述文档（功能说明、使用场景）
- Dictionary 和 DictionaryItem 实体定义文档
- 11 个 RESTful API 接口完整文档
- 数据关系图（ER 图）
- MySQL 数据库表结构设计（含索引）
- 接口汇总对照表

**技术栈版本**：
- NestJS@11.0.1
- TypeORM@0.3.28
- class-validator@0.15.1
- MySQL@8.0

---

**本次更新模块**：dic（字典模块）

> 文档路径：`docs/dic-module/backend-api.md`
