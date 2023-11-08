import { PartialType } from '@nestjs/mapped-types';
import { CreateVoucherRequestDto } from './create-voucher-request.dto';

export class UpdateVoucherRequestDto extends PartialType(
  CreateVoucherRequestDto,
) {}
