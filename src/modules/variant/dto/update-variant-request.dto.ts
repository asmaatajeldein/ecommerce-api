import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantRequestDto } from './create-variant-request.dto';

export class UpdateVariantRequestDto extends PartialType(
  CreateVariantRequestDto,
) {}
