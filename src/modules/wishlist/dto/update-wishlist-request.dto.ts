import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWishlistRequestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsNumber()
  productVariantId?: number;
}
