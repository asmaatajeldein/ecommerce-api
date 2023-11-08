import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoryRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
