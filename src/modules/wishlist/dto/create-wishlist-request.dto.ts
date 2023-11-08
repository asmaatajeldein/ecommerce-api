import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWishlistRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  isPrivate?: boolean;
}
