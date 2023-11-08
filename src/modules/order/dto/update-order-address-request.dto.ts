import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateOrderAddressRequestDto {
  @IsNotEmpty()
  @IsNumber()
  addressId: number;
}
