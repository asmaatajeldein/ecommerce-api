import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAddressRequestDto {
  @IsNotEmpty()
  @IsNumber()
  cityId: number;

  @IsNotEmpty()
  @IsString()
  address1: string;

  @IsNotEmpty()
  @IsString()
  address2: string;
}
