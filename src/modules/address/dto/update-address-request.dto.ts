import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressRequestDto } from './create-address-request.dto';

export class UpdateAddressRequestDto extends PartialType(
  CreateAddressRequestDto,
) {}
