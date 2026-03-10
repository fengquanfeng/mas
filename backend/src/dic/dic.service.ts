import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dictionary } from './dictionary.entity';
import { DictionaryItem } from './dictionary-item.entity';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';

/**
 * 字典服务层
 * 处理字典分类和字典项的业务逻辑
 */
@Injectable()
export class DicService {
  constructor(
    @InjectRepository(Dictionary)
    private dictionaryRepository: Repository<Dictionary>,
    @InjectRepository(DictionaryItem)
    private dictionaryItemRepository: Repository<DictionaryItem>,
  ) {}

  // ==================== 字典分类相关方法 ====================

  /**
   * 获取字典树（包含字典分类及其字典项）
   * 字典项作为 children 返回，供前端树形展示
   */
  async findAllTrees() {
    const dictionaries = await this.dictionaryRepository.find({
      relations: ['items'],
      order: {
        createdAt: 'ASC',
      },
    });

    return dictionaries.map(dict => ({
      id: String(dict.id),
      code: dict.code,
      name: dict.name,
      createdAt: dict.createdAt,
      updatedAt: dict.updatedAt,
      // 字典项作为 children，前端暂时不展示，待组件问题解决后启用
      children: dict.items
        ?.sort((a, b) => a.orderNum - b.orderNum)
        .map(item => ({
          id: String(item.id),
          dictionaryId: item.dictionaryId,
          name: item.name,
          value: item.value,
          orderNum: item.orderNum,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) || [],
    }));
  }

  /**
   * 根据编码获取字典详情
   * @param code 字典编码
   */
  async findOneByCode(code: string) {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { code },
      relations: ['items'],
    });

    if (!dictionary) {
      throw new HttpException(
        {
          code: 404,
          message: '字典不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: String(dictionary.id),
      code: dictionary.code,
      name: dictionary.name,
      createdAt: dictionary.createdAt,
      updatedAt: dictionary.updatedAt,
      items: dictionary.items
        ?.sort((a, b) => a.orderNum - b.orderNum)
        .map(item => ({
          id: String(item.id),
          dictionaryId: item.dictionaryId,
          name: item.name,
          value: item.value,
          orderNum: item.orderNum,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) || [],
    };
  }

  /**
   * 创建字典分类
   * @param createDictionaryDto 创建字典DTO
   */
  async createDictionary(createDictionaryDto: CreateDictionaryDto) {
    // 检查编码是否已存在
    const existingDict = await this.dictionaryRepository.findOne({
      where: { code: createDictionaryDto.code },
    });

    if (existingDict) {
      throw new HttpException(
        {
          code: 400,
          message: '字典编码已存在',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 检查名称是否已存在
    const existingByName = await this.dictionaryRepository.findOne({
      where: { name: createDictionaryDto.name },
    });

    if (existingByName) {
      throw new HttpException(
        {
          code: 400,
          message: '字典名称已存在',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const dictionary = this.dictionaryRepository.create(createDictionaryDto);
    await this.dictionaryRepository.save(dictionary);

    // 返回字符串ID（TypeORM 会自动将自增ID转为字符串）
    return {
      id: String(dictionary.id),
      code: dictionary.code,
      name: dictionary.name,
      createdAt: dictionary.createdAt,
      updatedAt: dictionary.updatedAt,
    };
  }

  /**
   * 更新字典分类
   * @param id 字典ID
   * @param updateDictionaryDto 更新字典DTO
   */
  async updateDictionary(id: string, updateDictionaryDto: UpdateDictionaryDto) {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
    });

    if (!dictionary) {
      throw new HttpException(
        {
          code: 404,
          message: '字典不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 如果更新编码，检查是否与其他字典冲突
    if (updateDictionaryDto.code && updateDictionaryDto.code !== dictionary.code) {
      const existingDict = await this.dictionaryRepository.findOne({
        where: { code: updateDictionaryDto.code },
      });

      if (existingDict) {
        throw new HttpException(
          {
            code: 400,
            message: '字典编码已存在',
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.dictionaryRepository.update(id, updateDictionaryDto);

    const updatedDictionary = await this.dictionaryRepository.findOne({
      where: { id },
    });

    if (!updatedDictionary) {
      throw new HttpException(
        {
          code: 404,
          message: '字典不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: String(updatedDictionary.id),
      code: updatedDictionary.code,
      name: updatedDictionary.name,
      createdAt: updatedDictionary.createdAt,
      updatedAt: updatedDictionary.updatedAt,
    };
  }

  /**
   * 删除字典分类
   * @param id 字典ID
   */
  async removeDictionary(id: string) {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!dictionary) {
      throw new HttpException(
        {
          code: 404,
          message: '字典不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 删除关联的字典项
    if (dictionary.items && dictionary.items.length > 0) {
      await this.dictionaryItemRepository.remove(dictionary.items);
    }

    await this.dictionaryRepository.remove(dictionary);

    return {
      id,
      message: '删除成功',
    };
  }

  // ==================== 字典项相关方法 ====================

  /**
   * 根据字典编码获取字典项列表
   * @param code 字典编码
   */
  async findItemsByDictionaryCode(code: string) {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { code },
      relations: ['items'],
    });

    if (!dictionary) {
      throw new HttpException(
        {
          code: 404,
          message: '字典不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const items = dictionary.items
      ?.sort((a, b) => a.orderNum - b.orderNum)
      .map(item => ({
        id: String(item.id),
        dictionaryId: item.dictionaryId,
        name: item.name,
        value: item.value,
        orderNum: item.orderNum,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) || [];

    return {
      dictionaryId: String(dictionary.id),
      dictionaryCode: dictionary.code,
      dictionaryName: dictionary.name,
      items,
    };
  }

  /**
   * 根据ID获取字典项详情
   * @param id 字典项ID
   */
  async findOneItem(id: string) {
    const item = await this.dictionaryItemRepository.findOne({
      where: { id },
      relations: ['dictionary'],
    });

    if (!item) {
      throw new HttpException(
        {
          code: 404,
          message: '字典项不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: String(item.id),
      dictionaryId: item.dictionaryId,
      dictionaryCode: item.dictionary?.code,
      dictionaryName: item.dictionary?.name,
      name: item.name,
      value: item.value,
      orderNum: item.orderNum,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * 创建字典项
   * 字典项ID = 字典ID * 1000 + 序号
   * 例如：字典ID="1"，序号从1开始，字典项ID="1001"
   * @param createDictionaryItemDto 创建字典项DTO
   */
  async createItem(createDictionaryItemDto: CreateDictionaryItemDto) {
    // 检查字典是否存在
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id: createDictionaryItemDto.dictionaryId },
    });

    if (!dictionary) {
      throw new HttpException(
        {
          code: 404,
          message: '所属字典不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 计算字典项ID = 字典ID * 1000 + (最大序号+1)
    const maxItem = await this.dictionaryItemRepository
      .createQueryBuilder('item')
      .where('item.dictionaryId = :dictionaryId', { dictionaryId: createDictionaryItemDto.dictionaryId })
      .orderBy('item.id', 'DESC')
      .getOne();

    let sequenceNum = 1;  // 默认从1开始
    if (maxItem) {
      // 从已有最大ID中提取序号，最大ID = 字典ID * 1000 + 序号
      const maxIdNum = Number(maxItem.id);
      const dictIdNum = Number(dictionary.id);
      sequenceNum = maxIdNum - dictIdNum * 1000 + 1;
    }

    // 生成新的字典项ID：字典ID * 1000 + 序号
    const newItemId = String(Number(dictionary.id) * 1000 + sequenceNum);

    const item = this.dictionaryItemRepository.create({
      id: newItemId,
      dictionaryId: createDictionaryItemDto.dictionaryId,
      name: createDictionaryItemDto.name,
      value: createDictionaryItemDto.value,
      orderNum: createDictionaryItemDto.orderNum ?? 0,
      status: createDictionaryItemDto.status ?? 1,
    });

    await this.dictionaryItemRepository.save(item);

    return {
      id: String(item.id),
      dictionaryId: item.dictionaryId,
      name: item.name,
      value: item.value,
      orderNum: item.orderNum,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * 更新字典项
   * @param id 字典项ID
   * @param updateDictionaryItemDto 更新字典项DTO
   */
  async updateItem(id: string, updateDictionaryItemDto: UpdateDictionaryItemDto) {
    const item = await this.dictionaryItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new HttpException(
        {
          code: 404,
          message: '字典项不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 如果更新所属字典，检查新字典是否存在
    if (updateDictionaryItemDto.dictionaryId && updateDictionaryItemDto.dictionaryId !== item.dictionaryId) {
      const dictionary = await this.dictionaryRepository.findOne({
        where: { id: updateDictionaryItemDto.dictionaryId },
      });

      if (!dictionary) {
        throw new HttpException(
          {
            code: 404,
            message: '所属字典不存在',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    await this.dictionaryItemRepository.update(id, updateDictionaryItemDto);

    const updatedItem = await this.dictionaryItemRepository.findOne({
      where: { id },
    });

    if (!updatedItem) {
      throw new HttpException(
        {
          code: 404,
          message: '字典项不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: String(updatedItem.id),
      dictionaryId: updatedItem.dictionaryId,
      name: updatedItem.name,
      value: updatedItem.value,
      orderNum: updatedItem.orderNum,
      status: updatedItem.status,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt,
    };
  }

  /**
   * 删除字典项
   * @param id 字典项ID
   */
  async removeItem(id: string) {
    const item = await this.dictionaryItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new HttpException(
        {
          code: 404,
          message: '字典项不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.dictionaryItemRepository.remove(item);

    return {
      id,
      message: '删除成功',
    };
  }

  /**
   * 更新字典项排序
   * @param id 字典项ID
   * @param orderNum 排序号
   */
  async updateItemSort(id: string, orderNum: number) {
    const item = await this.dictionaryItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new HttpException(
        {
          code: 404,
          message: '字典项不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.dictionaryItemRepository.update(id, { orderNum });

    return {
      id,
      orderNum,
      message: '排序更新成功',
    };
  }

  /**
   * 更新字典项状态
   * @param id 字典项ID
   * @param status 状态（0-禁用，1-启用）
   */
  async updateItemStatus(id: string, status: number) {
    const item = await this.dictionaryItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new HttpException(
        {
          code: 404,
          message: '字典项不存在',
          data: null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.dictionaryItemRepository.update(id, { status });

    return {
      id,
      status,
      message: '状态更新成功',
    };
  }
}
