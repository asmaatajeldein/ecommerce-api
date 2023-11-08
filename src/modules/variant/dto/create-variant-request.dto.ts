import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVariantRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  image: string;
}
