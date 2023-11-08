import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductRequestDto {
  @IsNotEmpty()
  @IsString()
  gtin: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @IsNumber()
  brandId: number;
}
