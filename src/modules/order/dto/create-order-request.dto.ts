import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateOrderRequestDto {
  @ValidateIf((obj) => obj?.paymentMethodId)
  @IsNotEmpty()
  @IsBoolean()
  saveCardInfo: boolean;

  @ValidateIf((obj) => obj?.saveCardInfo && obj.saveCardInfo === true)
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string;

  @IsOptional()
  @IsNumber()
  addressId?: number;

  @IsOptional()
  @IsString()
  voucherCode?: string;
}
