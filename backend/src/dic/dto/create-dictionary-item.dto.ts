import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateDictionaryItemDto {
  // id 由后端自动生成，前端传递的 id 会被忽略
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  dictionaryId: string;  // 字典ID，字符串类型

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
