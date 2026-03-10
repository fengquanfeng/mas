import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DicService } from './dic.service';
import { DicController } from './dic.controller';
import { Dictionary } from './dictionary.entity';
import { DictionaryItem } from './dictionary-item.entity';

/**
 * 字典管理模块
 * 提供字典分类和字典项的管理功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Dictionary, DictionaryItem]),
  ],
  controllers: [DicController],
  providers: [DicService],
  exports: [DicService],
})
export class DicModule {}
