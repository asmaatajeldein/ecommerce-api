import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCartItemRequestDto {
  @IsNotEmpty()
  @IsNumber()
  productVariantId: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}
