import { $Enums } from '@prisma/client';
import { IsIn, IsOptional } from 'class-validator';

export class RefundOrderRequestDto {
  @IsOptional()
  @IsIn(Object.keys($Enums.PaymentMethod))
  paymentState?: $Enums.PaymentState;
}
