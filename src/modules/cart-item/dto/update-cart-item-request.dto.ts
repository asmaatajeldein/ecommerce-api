import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCartItemRequestDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
