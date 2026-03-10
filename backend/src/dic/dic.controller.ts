import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DicService } from './dic.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';

/**
 * 字典管理控制器
 * 提供字典分类和字典项的 RESTful API 接口
 */
@Controller('api/dic')
export class DicController {
  constructor(private readonly dicService: DicService) {}

  // ==================== 字典分类接口 ====================

  /**
   * 获取字典树
   * GET /api/dic/tree
   */
  @Get('tree')
  async findAllTrees() {
    const data = await this.dicService.findAllTrees();
    return {
      code: 200,
      data,
      message: '',
    };
  }

  /**
   * 获取字典详情（根据编码）
   * GET /api/dic/:code
   */
  @Get(':code')
  async findOneByCode(@Param('code') code: string) {
    try {
      const data = await this.dicService.findOneByCode(code);
      return {
        code: 200,
        data,
        message: '',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 创建字典
   * POST /api/dic
   */
  @Post()
  async createDictionary(@Body() createDictionaryDto: CreateDictionaryDto) {
    try {
      const data = await this.dicService.createDictionary(createDictionaryDto);
      return {
        code: 200,
        data,
        message: '创建成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新字典
   * PUT /api/dic/:id
   */
  @Put(':id')
  async updateDictionary(
    @Param('id') id: string,
    @Body() updateDictionaryDto: UpdateDictionaryDto,
  ) {
    try {
      const data = await this.dicService.updateDictionary(id, updateDictionaryDto);
      return {
        code: 200,
        data,
        message: '更新成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除字典
   * DELETE /api/dic/:id
   */
  @Delete(':id')
  async removeDictionary(@Param('id') id: string) {
    try {
      const data = await this.dicService.removeDictionary(id);
      return {
        code: 200,
        data,
        message: '删除成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== 字典项接口 ====================

  /**
   * 获取字典项列表（根据字典编码）
   * GET /api/dic/:code/items
   */
  @Get(':code/items')
  async findItemsByDictionaryCode(@Param('code') code: string) {
    try {
      const data = await this.dicService.findItemsByDictionaryCode(code);
      return {
        code: 200,
        data,
        message: '',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 创建字典项
   * POST /api/dic/items
   */
  @Post('items')
  async createItem(@Body() createDictionaryItemDto: CreateDictionaryItemDto) {
    try {
      const data = await this.dicService.createItem(createDictionaryItemDto);
      return {
        code: 200,
        data,
        message: '创建成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新字典项
   * PUT /api/dic/items/:id
   */
  @Put('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() updateDictionaryItemDto: UpdateDictionaryItemDto,
  ) {
    try {
      const data = await this.dicService.updateItem(id, updateDictionaryItemDto);
      return {
        code: 200,
        data,
        message: '更新成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除字典项
   * DELETE /api/dic/items/:id
   */
  @Delete('items/:id')
  async removeItem(@Param('id') id: string) {
    try {
      const data = await this.dicService.removeItem(id);
      return {
        code: 200,
        data,
        message: '删除成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新字典项排序
   * PUT /api/dic/items/:id/sort
   */
  @Put('items/:id/sort')
  async updateItemSort(
    @Param('id') id: string,
    @Body('orderNum') orderNum: number,
  ) {
    try {
      // 验证排序号
      if (typeof orderNum !== 'number' || orderNum < 0) {
        throw new HttpException(
          {
            code: 400,
            message: '排序号必须是大于等于0的数字',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.dicService.updateItemSort(id, orderNum);
      return {
        code: 200,
        data,
        message: '排序更新成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新字典项状态
   * PUT /api/dic/items/:id/status
   */
  @Put('items/:id/status')
  async updateItemStatus(
    @Param('id') id: string,
    @Body('status') status: number,
  ) {
    try {
      // 验证状态值
      if (![0, 1].includes(status)) {
        throw new HttpException(
          {
            code: 400,
            message: '状态值必须是0或1',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.dicService.updateItemStatus(id, status);
      return {
        code: 200,
        data,
        message: '状态更新成功',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 500,
          message: '服务器内部错误',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
