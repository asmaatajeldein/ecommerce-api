import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateHistoryEntryRequestDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
