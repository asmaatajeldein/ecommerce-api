import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVariantDetailRequestDto {
  @IsNotEmpty()
  @IsNumber()
  detailId: number;

  @IsNotEmpty()
  @IsString()
  value: string;
}
