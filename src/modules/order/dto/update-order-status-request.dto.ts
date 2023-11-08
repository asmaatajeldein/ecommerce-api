import { $Enums } from '@prisma/client';
import { IsIn, IsNotEmpty, IsNotIn } from 'class-validator';

export class UpdateOrderStatusRequestDto {
  @IsNotEmpty()
  @IsIn(Object.keys($Enums.Status))
  @IsNotIn(['CANCELLED'])
  status: $Enums.Status;
}
