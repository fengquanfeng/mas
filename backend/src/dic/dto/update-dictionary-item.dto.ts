import { IsString, IsOptional, MaxLength, IsInt, Min, Max } from 'class-validator';

export class UpdateDictionaryItemDto {
  @IsString()
  @IsOptional()
  dictionaryId?: string;  // 字典ID，字符串类型

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
