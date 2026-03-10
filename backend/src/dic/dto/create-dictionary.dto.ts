import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateDictionaryDto {
  @IsOptional()
  id?: string;  // 字符串ID，不需要传

  @IsString()
  @MaxLength(100)
  name: string;  // 字典名称（必填）

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  code: string;  // 字典编码（必填，手动维护）
}
