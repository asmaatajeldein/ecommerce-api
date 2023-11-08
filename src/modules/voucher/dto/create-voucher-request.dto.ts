import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVoucherRequestDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  percentageDiscount: number;

  @IsNotEmpty()
  @IsNumber()
  upperLimit: number;
}
