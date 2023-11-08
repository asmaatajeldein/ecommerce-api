import { PickType } from '@nestjs/mapped-types';
import { CreateVariantDetailRequestDto } from './create-variant-detail-request.dto';

export class UpdateVariantDetailRequestDto extends PickType(
  CreateVariantDetailRequestDto,
  ['value'],
) {}
