# DIC 字典模块前后端实现方案

> 版本：v1.0.0 | 日期：2026-03-10

---

## 一、现状分析

### 1.1 后端现状

| 组件 | 状态 | 说明 |
|------|------|------|
| `dictionary.entity.ts` | ✅ 已存在 | 字典实体定义 |
| `dictionary-item.entity.ts` | ✅ 已存在 | 字典项实体定义 |
| `dic.module.ts` | ❌ 缺失 | 字典模块定义 |
| `dic.controller.ts` | ❌ 缺失 | 字典控制器 |
| `dic.service.ts` | ❌ 缺失 | 字典服务层 |
| DTO 文件 | ❌ 缺失 | 数据传输对象 |

**实体关系**：
```
Dictionary (1) ----< (N) DictionaryItem
- id                    - id
- name                  - dictionaryId
- code                  - name
- createdAt             - value
- updatedAt             - orderNum
- items[]               - status
                        - createdAt
                        - updatedAt
```

### 1.2 前端现状

| 组件 | 状态 | 说明 |
|------|------|------|
| `index.vue` | ✅ 已存在 | 字典管理主页面 |
| `dic.vue` | ✅ 已存在 | 字典分类弹窗 |
| `list.vue` | ✅ 已存在 | 字典项弹窗 |
| API 接口 | ⚠️ 部分 | 只有查询接口，缺少增删改 |

**现有 API 接口**（`src/api/model/system.js`）：
```javascript
dic: {
    tree: { url: '/system/dic/tree', name: "获取字典树" },      // ✅ 已定义
    list: { url: '/system/dic/list', name: "字典明细" },        // ✅ 已定义
    get: { url: '/system/dic/get', name: "获取字典数据" }       // ✅ 已定义
}
```

**问题分析**：
1. 前端表单提交使用的是 `$API.demo.post.post()`，是示例接口，需要替换为真实接口
2. 缺少字典分类的增删改接口
3. 缺少字典项的增删改接口
4. 接口管理分散在 `system.js` 中，不够清晰

---

## 二、后端实现方案

### 2.1 文件结构

```
backend/src/dic/
├── dto/
│   ├── create-dictionary.dto.ts       # 创建字典 DTO
│   ├── update-dictionary.dto.ts       # 更新字典 DTO
│   ├── create-dictionary-item.dto.ts  # 创建字典项 DTO
│   ├── update-dictionary-item.dto.ts  # 更新字典项 DTO
│   └── query-dictionary.dto.ts        # 查询字典 DTO
├── entities/                           # 实体目录（已存在）
│   ├── dictionary.entity.ts
│   └── dictionary-item.entity.ts
├── dic.controller.ts                   # 字典控制器
├── dic.service.ts                      # 字典服务
└── dic.module.ts                       # 字典模块
```

### 2.2 API 接口设计

#### 字典分类接口

| 方法 | 路径 | 功能 | 说明 |
|------|------|------|------|
| GET | `/dic` | 获取字典树 | 返回树形结构 |
| GET | `/dic/:code` | 获取字典详情 | 根据编码获取 |
| POST | `/dic` | 创建字典 | 新增字典分类 |
| PUT | `/dic/:id` | 更新字典 | 修改字典信息 |
| DELETE | `/dic/:id` | 删除字典 | 删除字典及其项 |

#### 字典项接口

| 方法 | 路径 | 功能 | 说明 |
|------|------|------|------|
| GET | `/dic/:code/items` | 获取字典项列表 | 根据字典编码获取 |
| GET | `/dic/items/:id` | 获取字典项详情 | 根据 ID 获取 |
| POST | `/dic/items` | 创建字典项 | 新增字典项 |
| PUT | `/dic/items/:id` | 更新字典项 | 修改字典项 |
| DELETE | `/dic/items/:id` | 删除字典项 | 删除单个字典项 |
| PUT | `/dic/items/:id/sort` | 更新排序 | 拖拽排序 |
| PUT | `/dic/items/:id/status` | 更新状态 | 启用/禁用 |

### 2.3 代码实现

#### 2.3.1 DTO 定义

**create-dictionary.dto.ts**
```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateDictionaryDto {
  @IsString()
  @MaxLength(50)
  id: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  code: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
```

**update-dictionary.dto.ts**
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateDictionaryDto } from './create-dictionary.dto';

export class UpdateDictionaryDto extends PartialType(CreateDictionaryDto) {}
```

**create-dictionary-item.dto.ts**
```typescript
import { IsString, IsInt, IsOptional, MaxLength, Min, Max } from 'class-validator';

export class CreateDictionaryItemDto {
  @IsString()
  @MaxLength(50)
  id: string;

  @IsString()
  @MaxLength(50)
  dictionaryId: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  value: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderNum?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}
```

**update-dictionary-item.dto.ts**
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateDictionaryItemDto } from './create-dictionary-item.dto';

export class UpdateDictionaryItemDto extends PartialType(CreateDictionaryItemDto) {}
```

**query-dictionary.dto.ts**
```typescript
import { IsOptional, IsString } from 'class-validator';

export class QueryDictionaryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
```

#### 2.3.2 Service 实现

**dic.service.ts**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dictionary } from './entities/dictionary.entity';
import { DictionaryItem } from './entities/dictionary-item.entity';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';

@Injectable()
export class DicService {
  constructor(
    @InjectRepository(Dictionary)
    private dictionaryRepository: Repository<Dictionary>,
    @InjectRepository(DictionaryItem)
    private dictionaryItemRepository: Repository<DictionaryItem>,
  ) {}

  // ==================== 字典分类 ====================

  async findAllTrees(): Promise<Dictionary[]> {
    const dictionaries = await this.dictionaryRepository.find({
      relations: ['items'],
      order: { createdAt: 'ASC' }
    });
    return this.buildTree(dictionaries);
  }

  private buildTree(dictionaries: Dictionary[]): Dictionary[] {
    const map = new Map<string, Dictionary>();
    const roots: Dictionary[] = [];

    dictionaries.forEach(item => {
      map.set(item.id, { ...item, children: [] } as any);
    });

    dictionaries.forEach(item => {
      const node = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId);
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async findOneByCode(code: string): Promise<Dictionary> {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { code },
      relations: ['items'],
    });
    if (!dictionary) {
      throw new NotFoundException(`字典 ${code} 不存在`);
    }
    return dictionary;
  }

  async createDictionary(createDto: CreateDictionaryDto): Promise<Dictionary> {
    const dictionary = this.dictionaryRepository.create(createDto);
    return this.dictionaryRepository.save(dictionary);
  }

  async updateDictionary(id: string, updateDto: UpdateDictionaryDto): Promise<Dictionary> {
    const dictionary = await this.dictionaryRepository.findOne({ where: { id } });
    if (!dictionary) {
      throw new NotFoundException(`字典 ${id} 不存在`);
    }
    Object.assign(dictionary, updateDto);
    return this.dictionaryRepository.save(dictionary);
  }

  async removeDictionary(id: string): Promise<void> {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!dictionary) {
      throw new NotFoundException(`字典 ${id} 不存在`);
    }
    // 先删除关联的字典项
    if (dictionary.items?.length > 0) {
      await this.dictionaryItemRepository.remove(dictionary.items);
    }
    await this.dictionaryRepository.remove(dictionary);
  }

  // ==================== 字典项 ====================

  async findItemsByDictionaryCode(code: string): Promise<DictionaryItem[]> {
    const dictionary = await this.dictionaryRepository.findOne({ where: { code } });
    if (!dictionary) {
      throw new NotFoundException(`字典 ${code} 不存在`);
    }
    return this.dictionaryItemRepository.find({
      where: { dictionaryId: dictionary.id },
      order: { orderNum: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneItem(id: string): Promise<DictionaryItem> {
    const item = await this.dictionaryItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`字典项 ${id} 不存在`);
    }
    return item;
  }

  async createItem(createDto: CreateDictionaryItemDto): Promise<DictionaryItem> {
    const item = this.dictionaryItemRepository.create(createDto);
    return this.dictionaryItemRepository.save(item);
  }

  async updateItem(id: string, updateDto: UpdateDictionaryItemDto): Promise<DictionaryItem> {
    const item = await this.dictionaryItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`字典项 ${id} 不存在`);
    }
    Object.assign(item, updateDto);
    return this.dictionaryItemRepository.save(item);
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.dictionaryItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`字典项 ${id} 不存在`);
    }
    await this.dictionaryItemRepository.remove(item);
  }

  async updateItemSort(id: string, orderNum: number): Promise<DictionaryItem> {
    const item = await this.dictionaryItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`字典项 ${id} 不存在`);
    }
    item.orderNum = orderNum;
    return this.dictionaryItemRepository.save(item);
  }

  async updateItemStatus(id: string, status: number): Promise<DictionaryItem> {
    const item = await this.dictionaryItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`字典项 ${id} 不存在`);
    }
    item.status = status;
    return this.dictionaryItemRepository.save(item);
  }
}
```

#### 2.3.3 Controller 实现

**dic.controller.ts**
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DicService } from './dic.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';
import { Dictionary } from './entities/dictionary.entity';
import { DictionaryItem } from './entities/dictionary-item.entity';

@Controller('dic')
export class DicController {
  constructor(private readonly dicService: DicService) {}

  // ==================== 字典分类 ====================

  @Get('tree')
  async findAllTrees(): Promise<Dictionary[]> {
    return this.dicService.findAllTrees();
  }

  @Get(':code')
  async findOneByCode(@Param('code') code: string): Promise<Dictionary> {
    return this.dicService.findOneByCode(code);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDictionary(@Body() createDto: CreateDictionaryDto): Promise<Dictionary> {
    return this.dicService.createDictionary(createDto);
  }

  @Put(':id')
  async updateDictionary(
    @Param('id') id: string,
    @Body() updateDto: UpdateDictionaryDto,
  ): Promise<Dictionary> {
    return this.dicService.updateDictionary(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDictionary(@Param('id') id: string): Promise<void> {
    return this.dicService.removeDictionary(id);
  }

  // ==================== 字典项 ====================

  @Get(':code/items')
  async findItemsByDictionaryCode(@Param('code') code: string): Promise<DictionaryItem[]> {
    return this.dicService.findItemsByDictionaryCode(code);
  }

  @Get('items/:id')
  async findOneItem(@Param('id') id: string): Promise<DictionaryItem> {
    return this.dicService.findOneItem(id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async createItem(@Body() createDto: CreateDictionaryItemDto): Promise<DictionaryItem> {
    return this.dicService.createItem(createDto);
  }

  @Put('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() updateDto: UpdateDictionaryItemDto,
  ): Promise<DictionaryItem> {
    return this.dicService.updateItem(id, updateDto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('id') id: string): Promise<void> {
    return this.dicService.removeItem(id);
  }

  @Put('items/:id/sort')
  async updateItemSort(
    @Param('id') id: string,
    @Body('orderNum') orderNum: number,
  ): Promise<DictionaryItem> {
    return this.dicService.updateItemSort(id, orderNum);
  }

  @Put('items/:id/status')
  async updateItemStatus(
    @Param('id') id: string,
    @Body('status') status: number,
  ): Promise<DictionaryItem> {
    return this.dicService.updateItemStatus(id, status);
  }
}
```

#### 2.3.4 Module 实现

**dic.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DicService } from './dic.service';
import { DicController } from './dic.controller';
import { Dictionary } from './entities/dictionary.entity';
import { DictionaryItem } from './entities/dictionary-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dictionary, DictionaryItem])],
  controllers: [DicController],
  providers: [DicService],
  exports: [DicService],
})
export class DicModule {}
```

#### 2.3.5 注册模块

修改 `app.module.ts`，添加 DicModule：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DicModule } from './dic/dic.module';  // 新增
// ... 其他模块

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(/* ... */),
    AuthModule,
    DicModule,  // 新增
    // ... 其他模块
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 三、前端实现方案

### 3.1 接口管理架构重构

#### 3.1.1 现有问题

1. **接口分散**：所有接口混在 `system.js` 中，难以维护
2. **命名不规范**：`$API.system.dic.tree.get()` 层级太深
3. **缺少类型提示**：没有 TypeScript 类型支持
4. **重复代码**：每个接口都要写 `url`、`name`、`get` 方法

#### 3.1.2 新架构设计

```
src/api/
├── index.js                    # 入口，自动导入所有模块
├── core/
│   ├── request.js              # 基于 axios 的请求封装
│   └── api-factory.js          # API 工厂函数
└── modules/                    # 按模块拆分
    ├── auth.js                 # 认证模块
    ├── dic.js                  # 字典模块（新增）
    ├── user.js                 # 用户模块
    ├── dept.js                 # 部门模块
    └── system.js               # 系统模块（精简）
```

#### 3.1.3 API 工厂函数

**src/api/core/api-factory.js**
```javascript
import http from '@/utils/request';
import config from '@/config';

/**
 * 创建 API 对象
 * @param {string} baseUrl - 基础 URL 路径
 * @param {Object} endpoints - 端点配置
 * @returns {Object} API 对象
 */
export function createApi(baseUrl, endpoints) {
  const api = {};
  
  for (const [key, endpoint] of Object.entries(endpoints)) {
    const url = `${config.API_URL}${baseUrl}${endpoint.path}`;
    
    api[key] = {
      url,
      name: endpoint.name,
      method: endpoint.method || 'get',
      
      // 请求方法
      request: async (data, options = {}) => {
        const method = endpoint.method?.toLowerCase() || 'get';
        const isGet = method === 'get';
        
        // 替换 URL 中的参数，如 :id
        let finalUrl = url;
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            if (finalUrl.includes(`:${key}`)) {
              finalUrl = finalUrl.replace(`:${key}`, data[key]);
            }
          });
        }
        
        // GET 请求参数放在 params，其他放在 data
        if (isGet) {
          return await http.get(finalUrl, { params: data, ...options });
        } else {
          return await http[method](finalUrl, data, options);
        }
      }
    };
    
    // 快捷方法
    api[key].get = api[key].request;
    api[key].post = api[key].request;
    api[key].put = api[key].request;
    api[key].delete = api[key].request;
  }
  
  return api;
}

/**
 * 创建 CRUD API
 * @param {string} baseUrl - 基础 URL
 * @param {string} name - 模块名称
 * @returns {Object} CRUD API 对象
 */
export function createCrudApi(baseUrl, name) {
  return createApi(baseUrl, {
    list: { path: '', name: `获取${name}列表`, method: 'get' },
    detail: { path: '/:id', name: `获取${name}详情`, method: 'get' },
    create: { path: '', name: `创建${name}`, method: 'post' },
    update: { path: '/:id', name: `更新${name}`, method: 'put' },
    delete: { path: '/:id', name: `删除${name}`, method: 'delete' },
  });
}
```

#### 3.1.4 字典模块 API

**src/api/modules/dic.js**
```javascript
import { createApi } from '../core/api-factory';

/**
 * 字典模块 API
 */
export const dicApi = createApi('/dic', {
  // 字典分类
  tree: { path: '/tree', name: '获取字典树', method: 'get' },
  detail: { path: '/:code', name: '获取字典详情', method: 'get' },
  create: { path: '', name: '创建字典', method: 'post' },
  update: { path: '/:id', name: '更新字典', method: 'put' },
  delete: { path: '/:id', name: '删除字典', method: 'delete' },
  
  // 字典项
  itemList: { path: '/:code/items', name: '获取字典项列表', method: 'get' },
  itemDetail: { path: '/items/:id', name: '获取字典项详情', method: 'get' },
  itemCreate: { path: '/items', name: '创建字典项', method: 'post' },
  itemUpdate: { path: '/items/:id', name: '更新字典项', method: 'put' },
  itemDelete: { path: '/items/:id', name: '删除字典项', method: 'delete' },
  itemSort: { path: '/items/:id/sort', name: '更新字典项排序', method: 'put' },
  itemStatus: { path: '/items/:id/status', name: '更新字典项状态', method: 'put' },
});

export default dicApi;
```

#### 3.1.5 API 入口文件

**src/api/index.js**
```javascript
// 同步导入 src/api/modules/ 下所有 .js 文件
const files = import.meta.glob('./modules/*.js', { eager: true });

const modules = {};

Object.keys(files).forEach((key) => {
  // 解析模块名：./modules/dic.js → dic
  const moduleName = key.replace(/(\.\/modules\/|\.js)/g, '');
  const module = files[key];
  
  // 优先使用命名导出，否则使用默认导出
  modules[moduleName] = module[moduleName + 'Api'] || module.default || module;
});

// 导出结构：{ dic: {...}, user: {...}, ... }
export default modules;

// 单独导出常用模块
export { dicApi } from './modules/dic';
```

### 3.2 前端页面修改

#### 3.2.1 字典分类弹窗 (dic.vue)

修改提交方法：

```javascript
/**
 * 表单提交
 */
const submit = () => {
  dialogForm.value.validate(async (valid) => {
    if (!valid) return;

    isSaveing.value = true;
    
    try {
      const api = mode.value === 'add' ? $API.dic.create : $API.dic.update;
      const params = mode.value === 'add' ? form : { ...form, id: form.id };
      const res = await api.request(params);

      if (res.code === 200) {
        emit('success', form, mode.value);
        visible.value = false;
        ElMessage.success('操作成功');
      } else {
        ElMessageBox.alert(res.message, '提示', { type: 'error' });
      }
    } catch (error) {
      ElMessageBox.alert(error.message || '操作失败', '提示', { type: 'error' });
    } finally {
      isSaveing.value = false;
    }
  });
}
```

#### 3.2.2 字典项弹窗 (list.vue)

修改提交方法：

```javascript
/**
 * 表单提交
 */
const submit = () => {
  dialogForm.value.validate(async (valid) => {
    if (!valid) return;

    isSaveing.value = true;
    
    try {
      // 转换字段名以匹配后端
      const submitData = {
        ...form,
        dictionaryId: form.dic,
        value: form.key,
        status: parseInt(form.yx),
      };
      
      const api = mode.value === 'add' ? $API.dic.itemCreate : $API.dic.itemUpdate;
      const params = mode.value === 'add' ? submitData : { ...submitData, id: form.id };
      const res = await api.request(params);

      if (res.code === 200) {
        emit('success', form, mode.value);
        visible.value = false;
        ElMessage.success('操作成功');
      } else {
        ElMessageBox.alert(res.message, '提示', { type: 'error' });
      }
    } catch (error) {
      ElMessageBox.alert(error.message || '操作失败', '提示', { type: 'error' });
    } finally {
      isSaveing.value = false;
    }
  });
}
```

#### 3.2.3 主页面 (index.vue)

修改删除方法：

```javascript
/**
 * 删除字典
 */
const dicDel = async (node, data) => {
  try {
    await ElMessageBox.confirm(`确定删除 ${data.name} 项吗？`, '提示', {
      type: 'warning'
    });
    
    showDicloading.value = true;
    
    // 调用删除接口
    await $API.dic.delete.request({ id: data.id });
    
    // 删除节点是否为高亮当前，是的话设置第一个节点高亮
    const dicCurrentKey = dic.value.getCurrentKey();
    dic.value.remove(data.id);
    
    if (dicCurrentKey === data.id) {
      const firstNode = dicList.value[0];
      if (firstNode) {
        dic.value.setCurrentKey(firstNode.id);
        table.value.upData({ code: firstNode.code });
      } else {
        listApi.value = null;
        table.value.tableData = [];
      }
    }

    ElMessage.success("删除成功");
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  } finally {
    showDicloading.value = false;
  }
}

/**
 * 删除字典项
 */
const table_del = async (row, index) => {
  try {
    await $API.dic.itemDelete.request({ id: row.id });
    table.value.tableData.splice(index, 1);
    ElMessage.success("删除成功");
  } catch (error) {
    ElMessageBox.alert(error.message || '删除失败', "提示", { type: 'error' });
  }
}

/**
 * 更新状态
 */
const changeSwitch = async (val, row) => {
  row.$switch_yx = true;
  
  try {
    await $API.dic.itemStatus.request({ 
      id: row.id, 
      status: parseInt(val) 
    });
    row.yx = val;
    ElMessage.success(`操作成功`);
  } catch (error) {
    // 还原状态
    row.yx = row.yx === '1' ? '0' : '1';
    ElMessage.error(error.message || '操作失败');
  } finally {
    delete row.$switch_yx;
  }
}

/**
 * 排序更新
 */
const rowDrop = () => {
  nextTick(() => {
    const tbody = table.value.$el.querySelector('.el-table__body-wrapper tbody');
    if (!tbody) return;
    
    Sortable.create(tbody, {
      handle: ".move",
      animation: 300,
      ghostClass: "ghost",
      async onEnd({ newIndex, oldIndex }) {
        const tableData = table.value.tableData;
        const currRow = tableData.splice(oldIndex, 1)[0];
        tableData.splice(newIndex, 0, currRow);
        
        // 更新排序到后端
        try {
          await $API.dic.itemSort.request({
            id: currRow.id,
            orderNum: newIndex
          });
          ElMessage.success("排序成功");
        } catch (error) {
          ElMessage.error(error.message || '排序失败');
          // 还原排序
          const revertRow = tableData.splice(newIndex, 1)[0];
          tableData.splice(oldIndex, 0, revertRow);
        }
      }
    });
  });
}
```

---

## 四、实施步骤

### 4.1 后端实施步骤

1. **安装依赖**
   ```bash
   cd backend
   npm install @nestjs/mapped-types
   ```

2. **创建 DTO 文件**
   - `src/dic/dto/create-dictionary.dto.ts`
   - `src/dic/dto/update-dictionary.dto.ts`
   - `src/dic/dto/create-dictionary-item.dto.ts`
   - `src/dic/dto/update-dictionary-item.dto.ts`

3. **创建 Service**
   - `src/dic/dic.service.ts`

4. **创建 Controller**
   - `src/dic/dic.controller.ts`

5. **创建 Module**
   - `src/dic/dic.module.ts`

6. **注册模块**
   - 修改 `src/app.module.ts`

7. **测试接口**
   - 启动后端：`npm run start:dev`
   - 使用 Postman 或 Swagger 测试接口

### 4.2 前端实施步骤

1. **创建 API 目录结构**
   ```
   src/api/
   ├── core/
   │   └── api-factory.js
   └── modules/
       └── dic.js
   ```

2. **实现 API 工厂**
   - `src/api/core/api-factory.js`

3. **实现字典 API**
   - `src/api/modules/dic.js`

4. **修改 API 入口**
   - `src/api/index.js`

5. **修改页面代码**
   - `src/views/setting/dic/index.vue`
   - `src/views/setting/dic/dic.vue`
   - `src/views/setting/dic/list.vue`

6. **测试功能**
   - 启动前端：`npm run dev`
   - 测试字典增删改查功能

---

## 五、接口对照表

| 功能 | 前端调用 | 后端接口 | 状态 |
|------|----------|----------|------|
| 获取字典树 | `$API.dic.tree.request()` | `GET /dic/tree` | 已存在 |
| 获取字典详情 | `$API.dic.detail.request({code})` | `GET /dic/:code` | 新增 |
| 创建字典 | `$API.dic.create.request(data)` | `POST /dic` | 新增 |
| 更新字典 | `$API.dic.update.request(data)` | `PUT /dic/:id` | 新增 |
| 删除字典 | `$API.dic.delete.request({id})` | `DELETE /dic/:id` | 新增 |
| 获取字典项列表 | `$API.dic.itemList.request({code})` | `GET /dic/:code/items` | 新增 |
| 创建字典项 | `$API.dic.itemCreate.request(data)` | `POST /dic/items` | 新增 |
| 更新字典项 | `$API.dic.itemUpdate.request(data)` | `PUT /dic/items/:id` | 新增 |
| 删除字典项 | `$API.dic.itemDelete.request({id})` | `DELETE /dic/items/:id` | 新增 |
| 更新排序 | `$API.dic.itemSort.request(data)` | `PUT /dic/items/:id/sort` | 新增 |
| 更新状态 | `$API.dic.itemStatus.request(data)` | `PUT /dic/items/:id/status` | 新增 |

---

## 六、注意事项

1. **数据一致性**：删除字典时会级联删除其下的所有字典项
2. **编码唯一性**：字典 code 字段需要保持唯一
3. **字段映射**：前端字段名（key/yx）与后端字段名（value/status）需要转换
4. **错误处理**：所有接口调用都需要添加 try-catch 错误处理
5. **加载状态**：提交操作时需要添加 loading 状态防止重复提交

---

> 文档版本：v1.0.0 | 生成时间：2026-03-10
