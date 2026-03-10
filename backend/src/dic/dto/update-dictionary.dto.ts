import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateDictionaryDto {
  @IsOptional()
  id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;
}
